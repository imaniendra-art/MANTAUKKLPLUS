import { NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";

import connectDB from '@/lib/db';
import Penilaian from '@/models/Penilaian';
import User from '@/models/User';
import Pokja from '@/models/Pokja';
import MitraKKL from '@/models/MitraKKL';

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

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
  } catch (error) {
    console.error('Error fetching rekapitulasi:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
