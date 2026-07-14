const mongoose = require('mongoose');
const LaporanAkhir = require('./models/LaporanAkhir.js').default;

async function run() {
  await mongoose.connect('mongodb://mantaukklp:makassar123@ac-udrhelw-shard-00-00.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-01.qlx3gje.mongodb.net:27017,ac-udrhelw-shard-00-02.qlx3gje.mongodb.net:27017/?ssl=true&replicaSet=atlas-nugn23-shard-0&authSource=admin&appName=Cluster0');
  
  // Revert both to revisi so user can test
  await LaporanAkhir.updateMany(
    { _id: { $in: ['6a4e52879ad398fdd6f482a6', '6a4e5c909ad398fdd6f483c1'] } },
    { $set: { status: 'revisi' } }
  );
  
  console.log("Reverted to revisi");
  mongoose.disconnect();
}
run();
