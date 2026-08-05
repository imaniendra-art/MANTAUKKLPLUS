import mongoose from 'mongoose';
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const pokjas = await db.collection('pokjas').find({}).toArray();
  console.log(JSON.stringify(pokjas, null, 2));
  process.exit(0);
}
main();
