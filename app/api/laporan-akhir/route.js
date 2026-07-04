import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import LaporanAkhir from '@/models/LaporanAkhir';

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const mhsId = searchParams.get('mhsId');
    const role = searchParams.get('role');
    const dplId = searchParams.get('dplId');
    const pokjaId = searchParams.get('pokjaId');
    const tipe = searchParams.get('tipe'); // 'individu' or 'pokja'

    // Jika dipanggil oleh DPL
    if (role === 'dpl' && dplId) {
      const pokjas = await Pokja.find({ dpl_id: dplId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const laporans = await LaporanAkhir.find({ 
        pokja_id: { $in: pokjaIds },
        status: { $in: ['submitted', 'revisi', 'disetujui'] }
      })
      .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn program_studi' })
      .populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } })
      .sort({ updatedAt: -1 });

      return NextResponse.json(laporans);
    }

    // Ambil laporan by pokjaId & tipe
    if (pokjaId && tipe) {
      let query = { pokja_id: pokjaId, tipe_laporan: tipe };
      if (tipe === 'individu' && mhsId) {
        query.mahasiswa_id = mhsId;
      }
      let laporan = await LaporanAkhir.findOne(query)
        .populate({ path: 'pokja_id', select: 'nama_pokja mitra_id', populate: { path: 'mitra_id' } });
      
      // Jika belum ada draft, kita return null saja, UI yang handle
      return NextResponse.json(laporan || null);
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const { 
      pokja_id,
      tipe_laporan,
      mahasiswa_id, 
      bab1_pendahuluan, 
      bab2_profil, 
      bab3_aktivitas, 
      bab4_permasalahan, 
      bab5_kesimpulan, 
      bab6_refleksi,
      file_laporan,
      status
    } = data;

    if (!pokja_id || !tipe_laporan) {
      return NextResponse.json({ error: "Missing pokja_id or tipe_laporan" }, { status: 400 });
    }

    let query = { pokja_id, tipe_laporan };
    if (tipe_laporan === 'individu') {
      query.mahasiswa_id = mahasiswa_id;
    }

    let laporan = await LaporanAkhir.findOne(query);
    
    if (laporan) {
      // Update
      laporan.bab1_pendahuluan = bab1_pendahuluan ?? laporan.bab1_pendahuluan;
      laporan.bab2_profil = bab2_profil ?? laporan.bab2_profil;
      laporan.bab3_aktivitas = bab3_aktivitas ?? laporan.bab3_aktivitas;
      laporan.bab4_permasalahan = bab4_permasalahan ?? laporan.bab4_permasalahan;
      laporan.bab5_kesimpulan = bab5_kesimpulan ?? laporan.bab5_kesimpulan;
      laporan.bab6_refleksi = bab6_refleksi ?? laporan.bab6_refleksi;
      laporan.file_laporan = file_laporan ?? laporan.file_laporan;
      laporan.status = status ?? laporan.status;
      await laporan.save();
    } else {
      // Create
      laporan = await LaporanAkhir.create({
        pokja_id,
        tipe_laporan,
        mahasiswa_id: tipe_laporan === 'individu' ? mahasiswa_id : undefined,
        bab1_pendahuluan,
        bab2_profil,
        bab3_aktivitas,
        bab4_permasalahan,
        bab5_kesimpulan,
        bab6_refleksi,
        file_laporan,
        status: status || 'draft'
      });
    }

    return NextResponse.json(laporan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const { id, status, catatan_dpl } = data;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const laporan = await LaporanAkhir.findById(id);
    if (!laporan) {
      return NextResponse.json({ error: "Laporan not found" }, { status: 404 });
    }

    laporan.status = status;
    if (catatan_dpl !== undefined) {
      laporan.catatan_dpl = catatan_dpl;
    }

    await laporan.save();
    return NextResponse.json(laporan);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
