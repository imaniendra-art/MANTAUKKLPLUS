const { MongoClient } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mantaumagang');

    // 1. Hapus semua transaksi
    const pResult = await db.collection('pengajuanmagangs').deleteMany({});
    console.log(`Deleted ${pResult.deletedCount} Pengajuan Magang.`);

    const lResult = await db.collection('logbooks').deleteMany({});
    console.log(`Deleted ${lResult.deletedCount} Logbooks.`);

    const eResult = await db.collection('evaluasis').deleteMany({});
    console.log(`Deleted ${eResult.deletedCount} Evaluasis.`);

    // 2. Hapus Mentor karena user minta hanya ada 3 mhs dan 1 dpl
    const mResult = await db.collection('users').deleteMany({ role: 'mentor' });
    console.log(`Deleted ${mResult.deletedCount} Mentor.`);

    // 3. Reset status Mahasiswa dan DPL menjadi belum aktif (isFirstLogin = true)
    const updateRes = await db.collection('users').updateMany(
      { role: { $in: ['mahasiswa', 'dpl'] } },
      { $set: { isFirstLogin: true } }
    );
    console.log(`Reset isFirstLogin for ${updateRes.modifiedCount} users.`);

    console.log("\nSelesai! Database bersih. Hanya tersisa Admin, 3 Mahasiswa, dan 1 DPL.");
    
    // Tampilkan sisa user
    const remainingUsers = await db.collection('users').find({}, { projection: { nama_lengkap: 1, role: 1, _id: 0 } }).toArray();
    console.log(remainingUsers);

  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
