import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';
import Pokja from './models/Pokja.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const pokja = await Pokja.findById('6a54637ece764ae77bdf0b25').lean();
  
  if (pokja.mitra_id) {
    const updated = await MitraKKL.findByIdAndUpdate(
      pokja.mitra_id,
      {
        desa_kelurahan: 'Sukamakmur',
        kecamatan: 'Sukajaya'
      },
      { new: true }
    );
    console.log("Updated MitraKKL:", updated.nama_instansi, "Desa:", updated.desa_kelurahan, "Kec:", updated.kecamatan);
  } else {
    console.log("No mitra_id found on this pokja");
  }
  
  mongoose.disconnect();
}
fix().catch(console.error);
