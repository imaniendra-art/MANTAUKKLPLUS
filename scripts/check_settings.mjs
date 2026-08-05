import mongoose from 'mongoose';
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const settings = await db.collection('systemsettings').find({}).toArray();
  console.log(JSON.stringify(settings, null, 2));
  process.exit(0);
}
main();
