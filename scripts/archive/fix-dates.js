const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

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
