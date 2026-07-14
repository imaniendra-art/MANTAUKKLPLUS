import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { MONGODB_URI } = process.env;

const PokjaSchema = new mongoose.Schema({
  nama_pokja: String,
  anggota: [{ user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  ketua_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'pokjas' });

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String
}, { collection: 'users' });

const LaporanSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tipe_laporan: String,
  status: String,
}, { collection: 'laporanakhirs' });

async function check() {
  await mongoose.connect(MONGODB_URI);
  const Pokja = mongoose.model('Pokja', PokjaSchema);
  const User = mongoose.model('User', UserSchema);
  const Laporan = mongoose.model('Laporan', LaporanSchema);

  const pokjas = await Pokja.find({}).populate('anggota.user_id ketua_id');

  const k1 = pokjas.find(p => p.nama_pokja.includes('1'));
  
  if (!k1) {
    console.log("No groups found containing '1'.");
    process.exit(0);
  }

  console.log("Kelompok:", k1.nama_pokja);

  const members = [k1.ketua_id, ...k1.anggota.map(a => a.user_id)].filter(Boolean);
  
  console.log("\nStatus Laporan Individu Anggota:");
  for (const member of members) {
    const l = await Laporan.findOne({ mahasiswa_id: member._id, tipe_laporan: 'individu' });
    if (!l) {
      console.log(`- ${member.nama_lengkap} (${member.nim_nidn}): BELUM MENGISI SAMA SEKALI`);
    } else {
      console.log(`- ${member.nama_lengkap} (${member.nim_nidn}): Sudah mengisi (Status: ${l.status})`);
    }
  }

  process.exit(0);
}

check().catch(console.error);
