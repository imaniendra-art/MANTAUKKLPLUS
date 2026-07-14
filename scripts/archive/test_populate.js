import dbConnect from './lib/db.js';
import Logbook from './models/Logbook.js';
import Proker from './models/Proker.js';
import Pokja from './models/Pokja.js';

async function run() {
  await dbConnect();
  
  const pokja = await Pokja.findOne({ nama_pokja: 'Kelompok 1' });
  const userIds = [pokja.ketua_id];
  pokja.anggota.forEach(a => userIds.push(a.user_id));
  
  const logbooks = await Logbook.find({ mahasiswa_id: { $in: userIds } }).populate('proker_id');
  let groups = {};
  for (let l of logbooks) {
    const name = l.proker_id?.nama_program || 'Lainnya';
    groups[name] = (groups[name] || 0) + 1;
  }
  
  console.log(groups);
  process.exit(0);
}
run();
