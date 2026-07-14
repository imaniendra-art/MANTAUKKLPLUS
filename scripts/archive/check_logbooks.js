import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { MONGODB_URI } = process.env;

const LogbookSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tipe_logbook: String,
  tanggal: Date,
  status: String
}, { collection: 'logbooks' });

async function check() {
  await mongoose.connect(MONGODB_URI);
  const Logbook = mongoose.model('Logbook', LogbookSchema);

  const targets = [
    { name: 'Yusuf Amrianto', nim: '2361201015' },
    { name: 'Rezky Aulia Aprilita', nim: '2361201014' },
    { name: 'Nur Amalia Putri', nim: '2361201013' },
    { name: 'Muh. Putra Pratama', nim: '2361201010' }
  ];

  const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users' }));
  
  for (const t of targets) {
    const user = await User.findOne({ nim_nidn: t.nim });
    if (!user) {
      console.log(`User ${t.name} tidak ditemukan.`);
      continue;
    }

    const logbooksIndividu = await Logbook.find({ mahasiswa_id: user._id, tipe_logbook: 'individu' }).sort({ tanggal: 1 });
    const logbooksKelompok = await Logbook.find({ mahasiswa_id: user._id, tipe_logbook: 'pokja' }).sort({ tanggal: 1 });
    
    console.log(`- ${t.name}: Individu: ${logbooksIndividu.length}, Proker: ${logbooksKelompok.length}`);
    
    if (logbooksIndividu.length > 0) {
      const first = logbooksIndividu[0].tanggal.toISOString().split('T')[0];
      const last = logbooksIndividu[logbooksIndividu.length - 1].tanggal.toISOString().split('T')[0];
      const disetujuiCount = logbooksIndividu.filter(l => l.status === 'disetujui').length;
      console.log(`  Logbook Individu (Rentang: ${first} s.d. ${last}). Yang disetujui: ${disetujuiCount}`);
    }
  }

  process.exit(0);
}

check().catch(console.error);
