import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-helper';
import Penilaian from '@/models/Penilaian';
import User from '@/models/User';
import Pokja from '@/models/Pokja';
import MitraKKL from '@/models/MitraKKL';

export const GET = withAdminAuth(async (req) => {
  // Fetch all grading records, populate mahasiswa, pokja, and within pokja populate dpl_id and mitra_id
  const penilaians = await Penilaian.find({})
    .populate('mahasiswa_id', 'nama_lengkap nim_nidn program_studi')
    .populate({
      path: 'pokja_id',
      select: 'nama_pokja dpl_id mitra_id',
      populate: [
        { path: 'dpl_id', select: 'nama_lengkap' },
        { path: 'mitra_id', select: 'nama_instansi desa_kelurahan kecamatan kabupaten_kota' }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(penilaians);
});
