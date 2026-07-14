import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';
import Pokja from './models/Pokja.js';
import User from './models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const mitras = await MitraKKL.find({ nama_instansi: { $regex: /bumdes berseri/i } });
  console.log("Found Mitras (bumdes berseri):", mitras.map(m => m.nama_instansi));

  const mitras2 = await MitraKKL.find({ nama_instansi: { $regex: /bumdes bersesri/i } });
  console.log("Found Mitras (bumdes bersesri):", mitras2.map(m => m.nama_instansi));

  if (mitras.length > 0) {
    for (let mitra of mitras) {
      const pokjas = await Pokja.find({ mitra_id: mitra._id }).populate('dpl_id').lean();
      console.log(`Found Pokjas for ${mitra.nama_instansi}:`, pokjas.map(p => ({ id: p._id, dpl: p.dpl_id?.nama_lengkap, status: p.status_pokja })));
    }
  }
  
  mongoose.disconnect();
}
check().catch(console.error);
