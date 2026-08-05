const mongoose = require('mongoose');
const LaporanAkhir = require('./models/LaporanAkhir.js').default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const laporans = await LaporanAkhir.find({ status: 'revisi' }).limit(5).lean();
  console.log("Laporan with revisi:");
  laporans.forEach(l => console.log(`ID: ${l._id}, Tipe: ${l.tipe_laporan}, Mhs: ${l.mahasiswa_id}, Pokja: ${l.pokja_id}, Status: ${l.status}`));

  const all = await LaporanAkhir.find().sort({ updatedAt: -1 }).limit(5).lean();
  console.log("\nRecently updated Laporans:");
  all.forEach(l => console.log(`ID: ${l._id}, Tipe: ${l.tipe_laporan}, Status: ${l.status}, UpdatedAt: ${l.updatedAt}`));

  mongoose.disconnect();
}
run();
