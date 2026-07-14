import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import Proker from './models/Proker.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const pokjaId = '6a54637ece764ae77bdf0b25';
  
  const pokja = await Pokja.findById(pokjaId).lean();
  
  const ketuaId = pokja.ketua_id;
  const anggotaIds = pokja.anggota.map(a => a.user_id).filter(Boolean);
  
  // Delete existing Prokers
  await Proker.deleteMany({ pokja_id: pokjaId });
  
  // Create exactly 1 Proker Utama for Ketua
  const prokerUtama = {
      pokja_id: pokjaId,
      judul_proker: "Re-vitalisasi & Digitalisasi Administrasi BUMDES Terpadu",
      deskripsi: "Sebagai program kerja utama yang dipimpin langsung oleh Ketua Kelompok, fokusnya adalah membangun ulang fondasi administrasi dan kelayakan bisnis BUMDES yang saat ini sedang pasif (mati segan hidup tak mau).",
      target_dampak: "BUMDES memiliki dokumen kelayakan usaha (business plan) baru dan template administrasi digital yang rapi.",
      jenis_proker: "Utama",
      pic_id: [ketuaId], // HANYA KETUA
      tanggal_mulai: new Date("2026-07-15"),
      tanggal_selesai: new Date("2026-08-25"),
      status_pelaksanaan: "Berjalan",
      status: "disetujui_dpl"
  };

  // Create Proker Pendukung for Anggota
  const prokerPendukung1 = {
      pokja_id: pokjaId,
      judul_proker: "Pelatihan Pemasaran Digital & Social Media Management",
      deskripsi: "Sebagai langkah awal pengenalan kembali BUMDES ke masyarakat luas, program ini melatih perwakilan pemuda desa membuat konten promosi produk/potensi desa secara mandiri di media sosial.",
      target_dampak: "Pengurus dan pemuda desa memiliki akun medsos resmi dan terbiasa berpromosi digital.",
      jenis_proker: "Pendukung",
      pic_id: [anggotaIds[0], anggotaIds[1]].filter(Boolean),
      tanggal_mulai: new Date("2026-08-01"),
      tanggal_selesai: new Date("2026-08-15"),
      status_pelaksanaan: "Belum Dimulai",
      status: "disetujui_dpl"
  };

  const prokerPendukung2 = {
      pokja_id: pokjaId,
      judul_proker: "Pemetaan UMKM Lokal Berpotensi Kemitraan BUMDES",
      deskripsi: "Melakukan survei door-to-door ke pelaku UMKM di desa untuk memetakan produk-produk potensial yang nantinya bisa dipasarkan atau didanai bersama oleh BUMDES.",
      target_dampak: "Tersedianya database UMKM desa lengkap dengan kontak dan jenis usaha yang berpotensi bekerjasama dengan BUMDES.",
      jenis_proker: "Pendukung",
      pic_id: [anggotaIds[2] || anggotaIds[0], anggotaIds[3] || anggotaIds[1]].filter(Boolean),
      tanggal_mulai: new Date("2026-07-20"),
      tanggal_selesai: new Date("2026-08-10"),
      status_pelaksanaan: "Belum Dimulai",
      status: "disetujui_dpl"
  };
  
  const created = await Proker.insertMany([prokerUtama, prokerPendukung1, prokerPendukung2]);
  console.log(`Created ${created.length} correct prokers!`);
  
  mongoose.disconnect();
}
seed().catch(console.error);
