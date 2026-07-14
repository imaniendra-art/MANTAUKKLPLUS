require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const MitraKKL = require('./models/MitraKKL');
  const Pokja = require('./models/Pokja');
  const User = require('./models/User');

  // Find Mitra first
  const mitras = await MitraKKL.find({ nama_mitra: { $regex: /bumdes berseri/i } });
  console.log("Found Mitras:", mitras);

  if (mitras.length > 0) {
    for (let mitra of mitras) {
      const pokjas = await Pokja.find({ mitra_id: mitra._id });
      console.log(`Found Pokjas for ${mitra.nama_mitra}:`, pokjas);
    }
  } else {
    // maybe try searching by nama_kelompok in Pokja?
    const allPokjas = await Pokja.find({}).limit(10).lean();
    console.log("Sample Pokjas:", allPokjas.map(p => p._id));
  }

  mongoose.disconnect();
}
check().catch(console.error);
