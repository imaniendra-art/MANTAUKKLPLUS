import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Logbook from './models/Logbook.js';
import Pokja from './models/Pokja.js';
import Proker from './models/Proker.js';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const pokjaId = '6a54637ece764ae77bdf0b25';
  
  const pokja = await Pokja.findById(pokjaId).lean();
  let baseDate = new Date(pokja.tanggal_mulai);
  // Normalize baseDate to start of day
  baseDate.setHours(0,0,0,0);
  
  await Logbook.deleteMany({ pokja_id: pokjaId });
  
  const logbooks = [];
  const endDate = new Date(baseDate);
  endDate.setDate(endDate.getDate() + 60); // 2 months
  
  let currentDate = new Date(baseDate);
  let dayCount = 1;
  let prokerCount = 1;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0) { // Not Sunday
      
      logbooks.push({
        tipe_logbook: 'individu',
        pokja_id: pokjaId,
        mahasiswa_id: pokja.ketua_id,
        tanggal: new Date(currentDate),
        rencana_target: `Agenda Harian KKL Hari ke-${dayCount}: Observasi & Kontribusi.`,
        uraian_kegiatan: `Melaksanakan kegiatan rutin harian desa. Terlibat dalam pengarahan rutin pagi, membantu administrasi desa di siang hari, dan melakukan rapat kelompok di sore hari.`,
        hasil_output: `Catatan harian dan rekap kegiatan kelompok selesai.`,
        kendala_solusi: dayCount % 5 === 0 ? "Banyak warga sedang ke kebun, solusi: menunda survei sore." : "-",
        bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Dokumentasi+Harian",
        keterangan_bukti: "Foto kegiatan hari ini",
        status_validasi: "menunggu_dpl",
      });
      dayCount++;

      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        logbooks.push({
          tipe_logbook: 'pokja',
          pokja_id: pokjaId,
          mahasiswa_id: pokja.ketua_id,
          tanggal: new Date(currentDate),
          rencana_target: `Eksekusi Proker Utama Tahap ${prokerCount}: Re-vitalisasi BUMDES.`,
          uraian_kegiatan: `Mendata ulang inventaris BUMDES dan menyusun format digital di excel. Membahasnya bersama sekretaris BUMDES.`,
          hasil_output: `Update sheet inventaris versi ${prokerCount}.`,
          kendala_solusi: prokerCount % 4 === 0 ? "Listrik padam, solusi: mencatat di kertas dulu." : "-",
          bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Dokumentasi+Proker",
          keterangan_bukti: "Foto dokumentasi pengerjaan proker",
          status_validasi: "menunggu_dpl",
        });
        prokerCount++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const prokerUtama = await Proker.findOne({ pokja_id: pokjaId, jenis_proker: 'Utama' }).lean();
  
  if (prokerUtama) {
      logbooks.forEach(l => {
          if (l.tipe_logbook === 'pokja') {
              l.proker_id = prokerUtama._id;
          }
      });
  }
  
  const created = await Logbook.insertMany(logbooks);
  console.log(`Re-seeded ${created.length} logbooks starting from ${baseDate.toISOString()}!`);
  mongoose.disconnect();
}
fix().catch(console.error);
