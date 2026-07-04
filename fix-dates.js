const mongoose = require('mongoose');
const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

async function fixDates() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const pengajuanList = await db.collection('pengajuanmagangs').find({ is_dpl_confirmed: true }).toArray();
  for (let p of pengajuanList) {
    if (p.tanggal_mulai && p.tanggal_selesai) {
      let tMulai = new Date(p.tanggal_mulai);
      let tSelesaiBaru = new Date(tMulai);
      tSelesaiBaru.setMonth(tMulai.getMonth() + 4);
      
      await db.collection('pengajuanmagangs').updateOne(
        { _id: p._id },
        { $set: { tanggal_selesai: tSelesaiBaru } }
      );
      console.log(`Updated ${p._id}: ${tMulai.toISOString()} -> ${tSelesaiBaru.toISOString()}`);
    }
  }
  
  await mongoose.disconnect();
}

fixDates().catch(console.error);
