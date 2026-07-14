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
  
  await Logbook.deleteMany({ pokja_id: pokjaId });
  
  const logbooks = [];
  const start = new Date("2026-07-15");
  
  // 10 Personal Logbooks
  for (let i = 0; i < 10; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + (i * 4)); // every 4 days
    
    logbooks.push({
      tipe_logbook: 'individu',
      pokja_id: pokjaId,
      mahasiswa_id: ketuaId,
      tanggal: d,
      rencana_target: `Target Personal Hari ke-${i+1}: Memahami operasional desa.`,
      uraian_kegiatan: `Melakukan observasi dan wawancara dengan tokoh masyarakat sekitar tentang BUMDES. Kegiatan berjalan lancar dan mendapatkan insight berharga.`,
      hasil_output: `Data observasi ${i+1} tercatat di buku catatan.`,
      kendala_solusi: i % 3 === 0 ? "Warga sibuk bekerja, solusi: wawancara di sore hari." : "-",
      bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Kegiatan+Personal",
      keterangan_bukti: "Foto saat wawancara",
      status_validasi: i < 5 ? "selesai" : "menunggu_dpl",
    });
  }

  // 10 Pokja Logbooks (for Proker Utama)
  for (let i = 0; i < 10; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + (i * 5)); // every 5 days
    
    logbooks.push({
      tipe_logbook: 'pokja',
      pokja_id: pokjaId,
      mahasiswa_id: ketuaId, // To track who submitted it, schema allows it
      proker_id: prokerUtama._id,
      tanggal: d,
      rencana_target: `Target Proker Tahap ${i+1}: Analisis Administrasi BUMDES.`,
      uraian_kegiatan: `Menyusun kerangka kerja dan mendigitalkan arsip fisik BUMDES bersama pengurus desa. Kami menggunakan Excel untuk menyusun neraca awal.`,
      hasil_output: `Draft dokumen administrasi versi ${i+1}.`,
      kendala_solusi: i % 2 === 0 ? "Beberapa arsip hilang, solusi: estimasi berdasarkan ingatan pengurus lama." : "-",
      bukti_kegiatan: "https://via.placeholder.com/600x400.png?text=Kegiatan+Proker",
      keterangan_bukti: "Foto saat rapat penyusunan draft",
      status_validasi: i < 7 ? "divalidasi_mentor" : "menunggu_dpl",
    });
  }
  
  const created = await Logbook.insertMany(logbooks);
  console.log(`Created ${created.length} logbooks for Ketua (Personal & Proker)`);
  
  mongoose.disconnect();
}
seed().catch(console.error);
