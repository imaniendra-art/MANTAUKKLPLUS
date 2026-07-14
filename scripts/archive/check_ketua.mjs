import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import User from './models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const p = await Pokja.findById('6a54637ece764ae77bdf0b25').populate('ketua_id').lean();
  console.log("Ketua:", p.ketua_id?.nama_lengkap);
  
  mongoose.disconnect();
}
check().catch(console.error);
