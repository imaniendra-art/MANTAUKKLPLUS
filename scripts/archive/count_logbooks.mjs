import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const pokjaId = '6a54637ece764ae77bdf0b25';
  
  const allLogs = await Logbook.find({ pokja_id: pokjaId });
  console.log("Total logbooks for pokja:", allLogs.length);
  
  const logsByDate = {};
  allLogs.forEach(l => {
    const d = new Date(l.tanggal).toISOString().split('T')[0];
    logsByDate[d] = (logsByDate[d] || 0) + 1;
  });
  console.log(logsByDate);
  mongoose.disconnect();
}
check().catch(console.error);
