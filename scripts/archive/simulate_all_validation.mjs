import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';

const POKJA_ID = '6a54637ece764ae77bdf0b25'; // Kelompok 1

async function simulateAllValidation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Temukan SEMUA logbook yang belum selesai di Kelompok 1
    const result = await Logbook.updateMany(
      { 
        pokja_id: POKJA_ID,
        status_validasi: { $ne: 'selesai' }
      },
      { 
        $set: {
          status_validasi: 'selesai',
          komentar_dpl: 'Validasi otomatis penuh - Kerja sangat bagus!',
          komentar_mentor: 'Validasi otomatis penuh - Kerja sangat bagus!'
        }
      }
    );

    console.log(`Berhasil memvalidasi sisa ${result.modifiedCount} logbook. Semua kini telah selesai!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simulateAllValidation();
