import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mitras = await MitraKKL.find({});
  for (let m of mitras) {
    let newStatus = m.status_kerjasama;
    if (m.file_ia) newStatus = 'Implementation Arrangement (IA)';
    else if (m.file_moa) newStatus = 'Memorandum of Agreement (MoA)';
    else if (m.file_mou) newStatus = 'Memorandum of Understanding (MoU)';
    
    if (newStatus !== m.status_kerjasama) {
      m.status_kerjasama = newStatus;
      await m.save();
      console.log(`Updated ${m.nama_instansi} to ${newStatus}`);
    }
  }
  
  mongoose.disconnect();
}
fix().catch(console.error);
