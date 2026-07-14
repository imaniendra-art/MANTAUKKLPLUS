import dbConnect from './lib/db.js';
import User from './models/User.js';
import Pokja from './models/Pokja.js';
import LaporanAkhir from './models/LaporanAkhir.js';

async function run() {
  await dbConnect();
  const user = await User.findOne({ nim_nidn: '2361201001' });
  if (!user) {
    console.log("User not found");
    process.exit(1);
  }
  
  const pokja = await Pokja.findOne({ 
    $or: [
      { ketua_id: user._id },
      { 'anggota.user_id': user._id }
    ]
  });
  
  if (!pokja) {
    console.log("Pokja not found for user");
    process.exit(1);
  }

  let laporan = await LaporanAkhir.findOne({
    tipe_laporan: 'individu',
    pokja_id: pokja._id,
    mahasiswa_id: user._id
  });

  if (!laporan) {
    laporan = new LaporanAkhir({
      tipe_laporan: 'individu',
      pokja_id: pokja._id,
      mahasiswa_id: user._id,
      status: 'draft'
    });
  }

  // Fungsi untuk generate lorem ipsum sesuai jumlah kata yang ditargetkan
  const generateWords = (count) => {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ";
    let result = "";
    while(result.split(' ').length < count) {
      result += lorem;
    }
    return result.split(' ').slice(0, count).join(' ');
  };

  laporan.kata_pengantar = generateWords(300);
  laporan.bab1_pendahuluan = generateWords(1500);
  laporan.bab2_metode = generateWords(1000);
  laporan.bab3_profil = generateWords(1200);
  laporan.bab4_hasil = generateWords(2500);
  laporan.bab5_penutup = generateWords(500);
  laporan.status = 'draft';

  await laporan.save();
  console.log("Laporan updated for", user.nama_lengkap);
  process.exit(0);
}
run();
