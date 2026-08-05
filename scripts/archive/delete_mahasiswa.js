const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

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
