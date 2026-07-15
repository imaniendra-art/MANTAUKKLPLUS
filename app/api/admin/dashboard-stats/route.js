import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MitraKKL from '@/models/MitraKKL';
import Pokja from '@/models/Pokja';
import LogAktivitas from '@/models/LogAktivitas';
import LaporanDpl from '@/models/LaporanDpl';

export async function GET() {
  await dbConnect();
  try {
    const totalMitra = await MitraKKL.countDocuments();

    const totalAjuan = await Pokja.countDocuments();
    const antreanValidasi = await Pokja.countDocuments({ status_pokja: 'menunggu_persetujuan_admin' });
    const posisiTerisi = await Pokja.countDocuments({ status_pokja: { $in: ['disetujui_admin', 'berjalan', 'selesai'] } });
    const antreanLaporanDpl = await LaporanDpl.countDocuments({ status: 'submitted' });

    // Aktivitas Cepat: 5 Log Terbaru
    const aktivitasTerbaru = await LogAktivitas.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const safeAktivitas = aktivitasTerbaru.map(item => ({
      _id: item._id,
      nama_mahasiswa: item.nama_mahasiswa || 'Sistem',
      aktivitas: item.aktivitas,
      status: item.status,
      waktu: item.createdAt
    }));

    return NextResponse.json({
      totalMitra,
      totalAjuan,
      antreanValidasi,
      posisiTerisi,
      antreanLaporanDpl,
      aktivitasTerbaru: safeAktivitas
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
