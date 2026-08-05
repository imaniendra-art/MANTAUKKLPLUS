const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mantaumagang');

    const users = await db.collection('users').find({}, { projection: { nama_lengkap: 1, nim_nidn: 1, role: 1, email: 1, _id: 0 } }).toArray();
    console.log(JSON.stringify(users, null, 2));
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
