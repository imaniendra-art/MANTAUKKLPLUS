import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import MitraKKL from './models/MitraKKL.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const updated = await MitraKKL.findOneAndUpdate(
    { nama_instansi: { $regex: /bumdes berseri/i } },
    {
      alamat_lengkap: "Jl. Poros Desa Berseri No. 12, RT 01 / RW 02, Desa Berseri",
      kecamatan: "Kecamatan Dummy",
      kabupaten_kota: "Kabupaten Maju",
      titik_koordinat: "-5.123456, 119.123456",
      link_maps: "https://maps.google.com/?q=-5.123456,119.123456",
      nama_pimpinan: "Bapak Budi Santoso",
      kontak_mitra: "081234567890",
      status_kerjasama: "Memorandum of Understanding (MoU)",
      kuota_maksimal: 10,
      fasilitas_khusus: "Ruang rapat ber-AC, WiFi, dan konsumsi harian",
      is_lengkap: true,
      foto_kantor_desa: "https://via.placeholder.com/600x400.png?text=Kantor+Desa+Berseri",
      foto_kantor_bumdes: "https://via.placeholder.com/600x400.png?text=Kantor+BUMDES",
      logo_mitra: "https://via.placeholder.com/150.png?text=Logo+Desa",
    },
    { new: true }
  );

  console.log("Updated Mitra:", updated?.nama_instansi, "| is_lengkap:", updated?.is_lengkap);
  
  mongoose.disconnect();
}
seed().catch(console.error);
