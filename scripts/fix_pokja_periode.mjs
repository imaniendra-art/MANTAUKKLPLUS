import mongoose from 'mongoose';
async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const settings = await db.collection('systemsettings').findOne({});
  const activePeriode = settings?.periode_aktif || "Genap 2025/2026";
  
  const res = await db.collection('pokjas').updateMany(
    {}, 
    { $set: { periode: activePeriode } }
  );
  
  console.log(`Updated ${res.modifiedCount} pokjas to periode: ${activePeriode}`);
  process.exit(0);
}
main();
