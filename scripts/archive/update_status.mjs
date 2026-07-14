import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await Logbook.updateMany({}, { status_validasi: 'menunggu_dpl' });
  console.log("Updated logbooks to menunggu_dpl:", result.modifiedCount);
  mongoose.disconnect();
}
update().catch(console.error);
