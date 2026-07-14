import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Pokja.findById('6a54637ece764ae77bdf0b25').lean();
  console.log("Tanggal Mulai Pokja:", p.tanggal_mulai);
  console.log("Tanggal Selesai Pokja:", p.tanggal_selesai);
  mongoose.disconnect();
}
check().catch(console.error);
