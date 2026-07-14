import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import Proker from './models/Proker.js';
import User from './models/User.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const pokjaId = '6a54637ece764ae77bdf0b25';
  
  const pokja = await Pokja.findById(pokjaId).lean();
  if (!pokja) {
    console.error("Pokja not found");
    return;
  }
  
  const allMemberIds = [pokja.ketua_id, ...pokja.anggota.map(a => a.user_id)].filter(Boolean);
  
  // Delete existing Prokers for this pokja
  await Proker.deleteMany({ pokja_id: pokjaId });
  
  // Create 3 realistic Prokers
  const prokers = [
    {
      pokja_id: pokjaId,
      judul_proker: "Re-branding & Pemetaan Unit Usaha Potensial BUMDES",
      deskripsi: "BUMDES saat ini berstatus pasif. Program ini fokus pada perancangan ulang identitas BUMDES (re-branding) dan melakukan survei/analisis kelayakan untuk menemukan 1 atau 2 unit usaha unggulan desa yang berpotensi menghidupkan kembali operasional BUMDES tanpa modal besar.",
      target_dampak: "Terbentuknya profil bisnis baru BUMDES dan dokumen kelayakan usaha (business plan) sederhana untuk dipresentasikan ke Kepala Desa.",
      jenis_proker: "Utama",
      pic_id: [allMemberIds[0], allMemberIds[1] || allMemberIds[0]],
      tanggal_mulai: new Date("2026-07-15"),
      tanggal_selesai: new Date("2026-08-15"),
      status_pelaksanaan: "Berjalan",
      status: "disetujui_dpl"
    },
    {
      pokja_id: pokjaId,
      judul_proker: "Digitalisasi Administrasi & Laporan Keuangan",
      deskripsi: "Sistem pencatatan BUMDES sebelumnya hilang atau amburadul sehingga menghambat kepercayaan publik. Program ini bertujuan membuatkan sistem buku kas dan pembukuan sederhana menggunakan Microsoft Excel / Google Sheets yang mudah dipahami oleh pengurus baru BUMDES.",
      target_dampak: "Tersedianya template laporan keuangan dan inventaris BUMDES yang rapi, transparan, dan siap pakai.",
      jenis_proker: "Utama",
      pic_id: [allMemberIds[2] || allMemberIds[0], allMemberIds[3] || allMemberIds[1] || allMemberIds[0]],
      tanggal_mulai: new Date("2026-07-20"),
      tanggal_selesai: new Date("2026-08-20"),
      status_pelaksanaan: "Belum Dimulai",
      status: "disetujui_dpl"
    },
    {
      pokja_id: pokjaId,
      judul_proker: "Pelatihan Pemasaran Digital & Social Media Management",
      deskripsi: "Sebagai langkah awal pengenalan kembali BUMDES ke masyarakat luas, program pendukung ini memberikan pelatihan dasar pembuatan konten dan pemasaran produk potensi desa melalui media sosial (Instagram/TikTok/WhatsApp Business).",
      target_dampak: "Pengurus BUMDES dan perwakilan pemuda desa memiliki akun media sosial resmi dan mampu memproduksi konten promosi secara mandiri.",
      jenis_proker: "Pendukung",
      pic_id: [allMemberIds[4] || allMemberIds[0], allMemberIds[5] || allMemberIds[0]],
      tanggal_mulai: new Date("2026-08-01"),
      tanggal_selesai: new Date("2026-08-25"),
      status_pelaksanaan: "Belum Dimulai",
      status: "disetujui_dpl"
    }
  ];
  
  const created = await Proker.insertMany(prokers);
  console.log(`Created ${created.length} dummy prokers!`);
  
  mongoose.disconnect();
}
seed().catch(console.error);
