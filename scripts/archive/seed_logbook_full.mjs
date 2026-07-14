import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import Proker from './models/Proker.js';
import Logbook from './models/Logbook.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const pokjaId = '6a54637ece764ae77bdf0b25';
  const pokja = await Pokja.findById(pokjaId).lean();
  const ketuaId = pokja.ketua_id;
  
  const prokerUtama = await Proker.findOne({ pokja_id: pokjaId, jenis_proker: 'Utama' }).lean();
  
  // Clear all logbooks for this pokja again
  await Logbook.deleteMany({ pokja_id: pokjaId });
  
  const logbooks = [];
  const startDate = new Date("2026-07-01");
  const endDate = new Date("2026-08-31");
  
  let currentDate = new Date(startDate);
  
  let dayCount = 1;
  let prokerCount = 1;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip Sunday (0)
    if (dayOfWeek !== 0) {
      
      // Personal logbook every day except Sunday
      logbooks.push({
        tipe_logbook: 'individu',
        pokja_id: pokjaId,
        mahasiswa_id: ketuaId,
        tanggal: new Date(currentDate),
        rencana_target: `Agenda Harian KKL Hari ke-${dayCount}: Observasi & Kontribusi.`,
        uraian_kegiatan: `Melaksanakan kegiatan rutin harian desa. Terlibat dalam pengarahan rutin pagi, membantu administrasi desa di siang hari, dan melakukan rapat kelompok di sore hari.`,
        hasil_output: `Catatan harian dan rekap kegiatan kelompok selesai.`,
        kendala_solusi: dayCount % 5 === 0 ? "Banyak warga sedang ke kebun, solusi: menunda survei sore." : "-",
        bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Dokumentasi+Harian",
        keterangan_bukti: "Foto kegiatan hari ini",
        status_validasi: dayCount < 40 ? "selesai" : (dayCount < 45 ? "divalidasi_mentor" : "menunggu_dpl"),
      });
      dayCount++;

      // Proker logbook every Monday, Wednesday, Friday (1, 3, 5)
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        logbooks.push({
          tipe_logbook: 'pokja',
          pokja_id: pokjaId,
          mahasiswa_id: ketuaId,
          proker_id: prokerUtama._id,
          tanggal: new Date(currentDate),
          rencana_target: `Eksekusi Proker Utama Tahap ${prokerCount}: Re-vitalisasi BUMDES.`,
          uraian_kegiatan: `Mendata ulang inventaris BUMDES dan menyusun format digital di excel. Membahasnya bersama sekretaris BUMDES.`,
          hasil_output: `Update sheet inventaris versi ${prokerCount}.`,
          kendala_solusi: prokerCount % 4 === 0 ? "Listrik padam, solusi: mencatat di kertas dulu." : "-",
          bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Dokumentasi+Proker",
          keterangan_bukti: "Foto dokumentasi pengerjaan proker",
          status_validasi: prokerCount < 18 ? "selesai" : "menunggu_mentor",
        });
        prokerCount++;
      }
    }
    
    // move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const created = await Logbook.insertMany(logbooks);
  console.log(`Created ${created.length} full daily logbooks for Ketua! (Personal: ${dayCount-1}, Proker: ${prokerCount-1})`);
  
  mongoose.disconnect();
}
seed().catch(console.error);
