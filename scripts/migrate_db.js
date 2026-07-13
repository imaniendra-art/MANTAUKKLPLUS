const mongoose = require('mongoose');
const path = require('path');
// require('dotenv').config({ path: '/Users/iman/Documents/GitHub/MANTAUKKLPLUS/.env.local' });

// Setup models
const UserSchema = new mongoose.Schema({
  role: { type: String },
  tipe_admin: { type: String }
}, { strict: false });

const PokjaSchema = new mongoose.Schema({
  status_pokja: { type: String },
  catatan_lppm: { type: String },
  catatan_admin: { type: String }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Pokja = mongoose.models.Pokja || mongoose.model('Pokja', PokjaSchema);

async function migrate() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // 1. Update Users: role 'lppm' to 'admin'
    const userResult = await User.updateMany(
      { role: 'lppm' },
      { $set: { role: 'admin', tipe_admin: 'lppm' } }
    );
    console.log(`Updated ${userResult.modifiedCount} users from role 'lppm' to 'admin'.`);

    // 2. Update Pokjas: rename field catatan_lppm to catatan_admin
    const pokjaFieldResult = await Pokja.updateMany(
      { catatan_lppm: { $exists: true } },
      { $rename: { 'catatan_lppm': 'catatan_admin' } }
    );
    console.log(`Renamed catatan_lppm to catatan_admin in ${pokjaFieldResult.modifiedCount} pokjas.`);

    // 3. Update Pokjas: replace status_pokja containing 'lppm' with 'admin'
    // This requires finding and updating one by one or using aggregation in update
    // We'll just fetch all that have 'lppm' in status and update them
    const pokjasToUpdate = await Pokja.find({ status_pokja: { $regex: 'lppm' } });
    let pokjaStatusCount = 0;
    for (const p of pokjasToUpdate) {
      if (p.status_pokja) {
        const newStatus = p.status_pokja.replace('lppm', 'admin');
        await Pokja.updateOne({ _id: p._id }, { $set: { status_pokja: newStatus } });
        pokjaStatusCount++;
      }
    }
    console.log(`Updated status_pokja for ${pokjaStatusCount} pokjas.`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
