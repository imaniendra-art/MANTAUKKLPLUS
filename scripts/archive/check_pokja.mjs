import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';
import Pokja from './models/Pokja.js';
import User from './models/User.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const mitras = await MitraKKL.find({ nama_mitra: { $regex: /bumdes berseri/i } });
  console.log("Found Mitras:", mitras);

  if (mitras.length > 0) {
    for (let mitra of mitras) {
      const pokjas = await Pokja.find({ mitra_id: mitra._id });
      console.log(`Found Pokjas for ${mitra.nama_mitra}:`, pokjas);
    }
  } else {
    console.log("Not found in Mitra, trying Pokja name");
    const pokjas = await Pokja.find({ nama_kelompok: { $regex: /bumdes/i } });
    console.log("Found in Pokja direct?", pokjas);
  }

  mongoose.disconnect();
}
check().catch(console.error);
