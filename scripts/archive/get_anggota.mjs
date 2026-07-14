import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import User from './models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const pokja = await Pokja.findById('6a54637ece764ae77bdf0b25').lean();
  console.log("Pokja ID:", pokja._id);
  console.log("Anggota IDs:", pokja.anggota_id);
  
  const members = await User.find({ _id: { $in: pokja.anggota_id } }).lean();
  console.log("Members:");
  members.forEach(m => console.log(`- ${m.nama_lengkap} (${m._id})`));
  
  mongoose.disconnect();
}
check().catch(console.error);
