import dbConnect from './lib/db.js';
import Logbook from './models/Logbook.js';

async function run() {
  await dbConnect();
  
  const logbooks = await Logbook.find({ proker_id: { $exists: true, $ne: null } }).limit(5);
  for (let l of logbooks) {
    console.log(l.proker_id);
  }
  process.exit(0);
}
run();
