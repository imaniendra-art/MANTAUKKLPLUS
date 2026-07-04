import dbConnect from './lib/db.js';
import LaporanAkhir from './models/LaporanAkhir.js';

async function clearLaporan() {
  await dbConnect();
  const res = await LaporanAkhir.deleteMany({});
  console.log(`Berhasil menghapus ${res.deletedCount} data Laporan Akhir.`);
  process.exit(0);
}

clearLaporan();
