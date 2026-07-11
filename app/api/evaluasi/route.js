import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import Logbook from '@/models/Logbook';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const dplId = searchParams.get('dplId');
    
    if (!dplId) return NextResponse.json({ error: "Missing dplId" }, { status: 400 });
    
    const SystemSettings = (await import('@/models/SystemSettings')).default;
    const settings = await SystemSettings.findOne({});
    const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

    const pokjas = await Pokja.find({ 
      dpl_id: dplId, 
      status_pokja: { $in: ['berjalan', 'selesai'] },
      periode: activePeriode
    })
      .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn' })
      .lean();
      
    let students = [];
    pokjas.forEach(p => {
       if (p.anggota) {
          p.anggota.forEach(a => {
             if (a.status_undangan === 'bergabung' && a.user_id) {
                students.push({
                   _id: `${p._id}_${a.user_id._id}`, // unique ID for frontend iteration
                   pokja_id: p._id,
                   mahasiswa_id: a.user_id, // contains populated fields
                   nilai_rekomendasi_sistem: a.nilai_rekomendasi_sistem || 0,
                   nilai_akhir_mutlak: a.nilai_akhir_mutlak, // might be undefined/0
                   catatan_evaluasi: a.catatan_evaluasi || '',
                   nama_pokja: p.nama_pokja
                });
             }
          });
       }
    });

    const results = await Promise.all(students.map(async (s) => {
      const logs = await Logbook.find({ 
        mahasiswa_id: s.mahasiswa_id._id, 
        status_validasi: 'divalidasi_dpl' 
      }).select('nilai_otomatis');
      
      let total = 0;
      let count = logs.length;
      
      logs.forEach(l => {
        total += l.nilai_otomatis || 0;
      });
      
      const computedScore = count > 0 ? Math.round(total / count) : 0;
      
      return {
        ...s,
        computed_rekomendasi: computedScore,
        logbook_count: count
      };
    }));
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { pokja_id, mahasiswa_id, nilai_rekomendasi_sistem, nilai_akhir_mutlak, catatan_evaluasi } = data;
    
    if (!pokja_id || !mahasiswa_id || nilai_akhir_mutlak === undefined) {
      // Compatibility with old payload if frontend wasn't updated yet
      // The frontend used to pass id as pengajuanId. Let's see if we can parse it from `id` if `pokja_id` missing.
      const idStr = data.id || '';
      if (idStr.includes('_')) {
         const parts = idStr.split('_');
         data.pokja_id = parts[0];
         data.mahasiswa_id = parts[1];
      }
      if (!data.pokja_id || !data.mahasiswa_id || data.nilai_akhir_mutlak === undefined) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
    }
    
    const pId = data.pokja_id;
    const mId = data.mahasiswa_id;

    const updated = await Pokja.findOneAndUpdate(
      { _id: pId, 'anggota.user_id': mId },
      { 
        $set: {
           'anggota.$.nilai_rekomendasi_sistem': data.nilai_rekomendasi_sistem,
           'anggota.$.nilai_akhir_mutlak': data.nilai_akhir_mutlak,
           'anggota.$.catatan_evaluasi': data.catatan_evaluasi
        }
      },
      { new: true }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
