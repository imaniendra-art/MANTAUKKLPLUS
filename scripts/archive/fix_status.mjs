import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';

const POKJA_ID = '6a54637ece764ae77bdf0b25';

async function fixStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Ambil semua logbook Kelompok 1, urut berdasarkan tanggal
    const logs = await Logbook.find({ pokja_id: POKJA_ID }).sort({ tanggal: 1 });
    console.log(`Ditemukan ${logs.length} logbook untuk dikoreksi statusnya.`);

    // Kita akan bikin:
    // Setengah awal logbook -> 'menunggu_dpl' (Agar bisa dites DPL)
    // Setengah akhir logbook -> 'menunggu_mentor' (Agar bisa dites Mentor)
    
    let dplCount = 0;
    let mentorCount = 0;
    
    // Karena kita mau per minggu ada yang dpl ada yang mentor per user,
    // kita kelompokkan by mahasiswa_id / proker_id dulu
    // Tapi gampangnya: 1 bulan pertama (Juli) -> menunggu_dpl
    // 1 bulan kedua (Agustus) -> menunggu_mentor
    
    for (const log of logs) {
      const logMonth = new Date(log.tanggal).getMonth(); // 6 for July, 7 for August
      if (logMonth === 6) { // Juli
        log.status_validasi = 'menunggu_dpl';
        dplCount++;
      } else { // Agustus
        log.status_validasi = 'menunggu_mentor';
        mentorCount++;
      }
      await log.save();
    }

    console.log(`Berhasil mengubah ${dplCount} logbook menjadi menunggu_dpl (Juli - Minggu awal)`);
    console.log(`Berhasil mengubah ${mentorCount} logbook menjadi menunggu_mentor (Agustus - Minggu akhir)`);

  } catch (error) {
    console.error('Error fixing status:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixStatus();
