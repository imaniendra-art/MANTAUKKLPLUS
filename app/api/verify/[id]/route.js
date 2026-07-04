import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import LaporanAkhir from '@/models/LaporanAkhir';
import User from '@/models/User';
import Pokja from '@/models/Pokja';

// Ensure DB is connected
const MONGODB_URI = process.env.MONGODB_URI;
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI);
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ valid: false, error: "ID dokumen tidak valid" }, { status: 400 });
    }

    const laporan = await LaporanAkhir.findById(id)
      .populate('mahasiswa_id', 'nama_lengkap nim_nidn email')
      .populate({
        path: 'pokja_id',
        populate: { path: 'mitra_id', select: 'nama_perusahaan nama_instansi' }
      });

    if (!laporan) {
      return NextResponse.json({ valid: false, error: "Dokumen tidak ditemukan dalam sistem" }, { status: 404 });
    }

    // Hanya dokumen yang statusnya submitted/disetujui yang dianggap valid secara publik
    if (laporan.status !== 'submitted' && laporan.status !== 'disetujui') {
      return NextResponse.json({ valid: false, error: "Dokumen ini masih dalam status draft dan belum diterbitkan secara resmi" }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      dokumen: {
        id: laporan._id,
        nama_mahasiswa: laporan.mahasiswa_id?.nama_lengkap || 'Tim Pokja',
        nim: laporan.mahasiswa_id?.nim_nidn || '-',
        mitra: laporan.pokja_id?.mitra_id?.nama_perusahaan || laporan.pokja_id?.mitra_id?.nama_instansi || 'Instansi Mitra',
        tanggal_selesai_magang: laporan.pokja_id?.tanggal_selesai,
        terbit_pada: laporan.updatedAt
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
