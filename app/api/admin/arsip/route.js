import { NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";

import connectDB from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import MitraKKL from '@/models/MitraKKL';
import Monev from '@/models/Monev';
import Logbook from '@/models/Logbook';
import LaporanDpl from '@/models/LaporanDpl';

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Ambil data Pokja beserta anggotanya (untuk cetak Surat, Sertifikat Mitra, Laporan Kelompok)
    const pokjas = await Pokja.find({})
      .populate('dpl_id', 'nama_lengkap nidn')
      .populate('mitra_id', 'nama_instansi alamat desa_kelurahan kecamatan kabupaten_kota provinsi foto_kantor_desa foto_kantor_bumdes logo_mitra file_mou file_moa file_ia status_kerjasama')
      .populate('anggota.user_id', 'nama_lengkap nim_nidn program_studi')
      .populate('ketua_id', 'nama_lengkap nim_nidn program_studi')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Extract Mahasiswa from Pokja
    const pengajuans = [];
    pokjas.forEach(pokja => {
      // Add ketua
      if (pokja.ketua_id) {
        pengajuans.push({
          _id: pokja.ketua_id._id,
          mahasiswa_id: pokja.ketua_id,
          pokja_id: pokja
        });
      }
      // Add anggota
      if (pokja.anggota && Array.isArray(pokja.anggota)) {
        pokja.anggota.forEach(a => {
          if (a.user_id && String(a.user_id._id) !== String(pokja.ketua_id?._id)) {
            pengajuans.push({
              _id: a.user_id._id,
              mahasiswa_id: a.user_id,
              pokja_id: pokja
            });
          }
        });
      }
    });

    // 3. Fetch Monev (Galeri Foto)
    const monevs = await Monev.find({ foto_url: { $exists: true, $ne: '' } })
      .populate('dpl_id', 'nama_lengkap')
      .populate('pokja_id', 'nama_pokja')
      .sort({ createdAt: -1 })
      .lean();

    // 4. Fetch Logbook Photos
    const logbooks = await Logbook.find({ bukti_kegiatan: { $exists: true, $ne: '' } })
      .populate('mahasiswa_id', 'nama_lengkap')
      .populate('pokja_id', 'nama_pokja')
      .sort({ tanggal_kegiatan: -1 })
      .limit(100)
      .lean();

    // 5. Fetch Laporan DPL
    const laporanDpls = await LaporanDpl.find({ status: { $in: ['submitted', 'disetujui'] } })
      .populate('dpl_id', 'nama_lengkap nim_nidn nidn')
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      pokjas,
      pengajuans,
      monevs,
      logbooks,
      laporanDpls
    });
  } catch (error) {
    console.error('Error fetching arsip:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
