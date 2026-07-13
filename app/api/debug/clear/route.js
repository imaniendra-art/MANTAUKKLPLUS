import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Absensi from '@/models/Absensi';
import LaporanAkhir from '@/models/LaporanAkhir';
import LogAktivitas from '@/models/LogAktivitas';
import Logbook from '@/models/Logbook';
import MagicLink from '@/models/MagicLink';
import Penilaian from '@/models/Penilaian';
import Pokja from '@/models/Pokja';
import PosisiKKL from '@/models/PosisiKKL';
import Proker from '@/models/Proker';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  try {
    await Absensi.deleteMany({});
    await LaporanAkhir.deleteMany({});
    await LogAktivitas.deleteMany({});
    await Logbook.deleteMany({});
    await MagicLink.deleteMany({});
    await Penilaian.deleteMany({});
    await Pokja.deleteMany({});
    await PosisiKKL.deleteMany({});
    await Proker.deleteMany({});
    
    // Hapus semua user selain admin dan dpl
    await User.deleteMany({ role: { $nin: ['admin', 'dpl'] } });

    return NextResponse.json({ message: "Semua data transaksi dan pengguna mahasiswa berhasil dibersihkan." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
