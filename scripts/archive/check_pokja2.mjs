import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';
import Pokja from './models/Pokja.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mitras = await MitraKKL.find({ nama_mitra: { $regex: /bersesri/i } });
  console.log("Mitra by bersesri:", mitras.map(m => m.nama_mitra));

  const allMitras = await MitraKKL.find({});
  console.log("All mitras:", allMitras.map(m => m.nama_mitra));
  
  mongoose.disconnect();
}
check().catch(console.error);
