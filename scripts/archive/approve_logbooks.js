import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { MONGODB_URI } = process.env;

const LogbookSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tipe_logbook: String,
  tanggal: Date,
  status: String,
  status_dpl: String
}, { collection: 'logbooks' });

async function approve() {
  await mongoose.connect(MONGODB_URI);
  const Logbook = mongoose.model('Logbook', LogbookSchema);
  const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users' }));

  const targets = ['2361201015', '2361201014', '2361201013', '2361201010'];
  
  for (const nim of targets) {
    const user = await User.findOne({ nim_nidn: nim });
    if (!user) continue;

    // Approve individu logbooks
    const resIndividu = await Logbook.updateMany(
      { mahasiswa_id: user._id, tipe_logbook: 'individu' },
      { $set: { status: 'disetujui', status_dpl: 'disetujui' } }
    );
    
    // Approve kelompok logbooks
    const resKelompok = await Logbook.updateMany(
      { mahasiswa_id: user._id, tipe_logbook: 'pokja' },
      { $set: { status: 'disetujui', status_dpl: 'disetujui' } }
    );

    console.log(`User ${nim}: Approved ${resIndividu.modifiedCount} individu, ${resKelompok.modifiedCount} kelompok`);
  }

  process.exit(0);
}

approve().catch(console.error);
