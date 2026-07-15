import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LaporanDpl from '@/models/LaporanDpl';
import Pokja from '@/models/Pokja';
import Proker from '@/models/Proker';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'dpl' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let dplIdToUse = session.user.id;
    if (session.user.role === 'admin' && id) {
      const laporanQuery = await LaporanDpl.findById(id).lean();
      if (!laporanQuery) return NextResponse.json({ error: "Report not found" }, { status: 404 });
      dplIdToUse = laporanQuery.dpl_id;
    } else if (session.user.role === 'admin') {
      return NextResponse.json({ error: "ID required for admin" }, { status: 400 });
    }

    // Get the report
    const laporan = await LaporanDpl.findOne({ dpl_id: dplIdToUse }).lean();
    
    // Also fetch pokjas for the DPL to send as metadata
    const pokjas = await Pokja.find({ 
      dpl_id: dplIdToUse,
      status_pokja: { $in: ['berjalan', 'selesai', 'disetujui_admin'] }
    })
      .populate('ketua_id', 'nama_lengkap nim_nidn')
      .populate('anggota.user_id', 'nama_lengkap nim_nidn')
      .populate('mitra_id', 'nama_instansi alamat_lengkap desa_kelurahan kecamatan kabupaten_kota')
      .lean();

    const pokjaIds = pokjas.map(p => p._id);
    const prokers = await Proker.find({ pokja_id: { $in: pokjaIds } }).lean();

    // Attach proker to pokja
    const pokjasWithProkers = pokjas.map(p => ({
      ...p,
      prokers: prokers.filter(pr => pr.pokja_id.toString() === p._id.toString())
    }));

    return NextResponse.json({ laporan: laporan || null, pokjas: pokjasWithProkers });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      latar_belakang,
      tujuan_pembimbingan,
      jadwal_pembekalan,
      jadwal_monitoring_1,
      jadwal_monitoring_2,
      jadwal_penarikan,
      proker_utama, 
      proker_penunjang, 
      evaluasi_kinerja, 
      evaluasi_prokers,
      kendala_lapangan, 
      solusi_lapangan, 
      kesimpulan, 
      saran, 
      isSubmit 
    } = await req.json();

    const updateData = {
      latar_belakang,
      tujuan_pembimbingan,
      jadwal_pembekalan,
      jadwal_monitoring_1,
      jadwal_monitoring_2,
      jadwal_penarikan,
      proker_utama,
      proker_penunjang,
      evaluasi_kinerja,
      evaluasi_prokers,
      kendala_lapangan,
      solusi_lapangan,
      kesimpulan,
      saran,
      status: isSubmit ? 'submitted' : 'draft',
    };

    // Upsert LaporanDpl
    const updatedLaporan = await LaporanDpl.findOneAndUpdate(
      { dpl_id: session.user.id },
      updateData,
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Laporan berhasil disimpan", laporan: updatedLaporan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
