const { MongoClient } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mantaumagang');

    // 1. Data Mahasiswa (User dengan role 'mahasiswa')
    const usersResult = await db.collection('users').deleteMany({ role: 'mahasiswa' });
    console.log(`Deleted ${usersResult.deletedCount} mahasiswa from users collection.`);

    // 2. Data Tempat Magang / Mitra
    const mitraResult = await db.collection('mitramagangs').deleteMany({});
    console.log(`Deleted ${mitraResult.deletedCount} mitra from mitramagangs collection.`);

    // 3. Data Posisi Magang
    // In our schema, Posisi Magang might be inside PengajuanKKL or it might be its own collection. Let's clear PengajuanKKLs too.
    const pengajuanResult = await db.collection('pengajuanmagangs').deleteMany({});
    console.log(`Deleted ${pengajuanResult.deletedCount} pengajuan from pengajuanmagangs collection.`);

    // 4. Data PaketMatkul lama
    const paketResult = await db.collection('paketmatkuls').deleteMany({});
    console.log(`Deleted ${paketResult.deletedCount} paket from paketmatkuls collection.`);

    // 5. Clear Logbooks for safety
    const logbookResult = await db.collection('logbooks').deleteMany({});
    console.log(`Deleted ${logbookResult.deletedCount} logbooks from logbooks collection.`);

    console.log("Database cleanup completed successfully.");
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
