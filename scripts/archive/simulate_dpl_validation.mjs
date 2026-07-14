import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';

const POKJA_ID = '6a54637ece764ae77bdf0b25'; // Kelompok 1

async function simulateDplValidation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Temukan logbook yang sedang 'menunggu_dpl' di Kelompok 1
    const result = await Logbook.updateMany(
      { 
        pokja_id: POKJA_ID,
        status_validasi: 'menunggu_dpl'
      },
      { 
        $set: {
          status_validasi: 'selesai',
          komentar_dpl: 'ACC DPL - Tetap semangat dan tingkatkan kinerja!'
        }
      }
    );

    console.log(`Berhasil memvalidasi ${result.modifiedCount} logbook atas nama DPL.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simulateDplValidation();
