const mongoose = require('mongoose');
const LaporanAkhir = require('./models/LaporanAkhir.js').default;

async function run() {
  await mongoose.connect('mongodb://mantaukklp:makassar123@ac-udrhelw-shard-00-00.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-01.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-02.qlx3gje.mongodb.net:27017/?ssl=true&replicaSet=atlas-nugn23-shard-0&authSource=admin&appName=Cluster0');
  
  const laporans = await LaporanAkhir.find({ status: 'revisi' }).limit(5).lean();
  console.log("Laporan with revisi:");
  laporans.forEach(l => console.log(`ID: ${l._id}, Tipe: ${l.tipe_laporan}, Mhs: ${l.mahasiswa_id}, Pokja: ${l.pokja_id}, Status: ${l.status}`));

  const all = await LaporanAkhir.find().sort({ updatedAt: -1 }).limit(5).lean();
  console.log("\nRecently updated Laporans:");
  all.forEach(l => console.log(`ID: ${l._id}, Tipe: ${l.tipe_laporan}, Status: ${l.status}, UpdatedAt: ${l.updatedAt}`));

  mongoose.disconnect();
}
run();
