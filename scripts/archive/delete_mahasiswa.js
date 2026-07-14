const { MongoClient } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mantaumagang');

    const usersResult = await db.collection('users').deleteMany({ role: 'mahasiswa' });
    console.log(`Berhasil menghapus ${usersResult.deletedCount} akun mahasiswa dari database.`);
  } catch (err) {
    console.error("Gagal menghapus:", err);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
