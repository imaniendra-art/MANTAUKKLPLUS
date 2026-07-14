import mongoose from 'mongoose';

const MitraKKLSchema = new mongoose.Schema({
  // Base Fields (Admin)
  nama_instansi: { type: String, required: true },
  kategori: { 
    type: String, 
    enum: [
      'Pemerintahan & Desa (Sektor Publik)', 
      'Bisnis & Ekonomi Kerakyatan', 
      'Industri & Korporasi (Sektor Privat)', 
      'Pendidikan, Sosial & Kesehatan', 
      'Organisasi Kemasyarakatan'
    ], 
    required: true 
  },
  deskripsi_singkat: { type: String, required: false },

  // Detail Fields (Mahasiswa)
  alamat_lengkap: { type: String, default: '' },
  desa_kelurahan: { type: String, default: '' },
  kecamatan: { type: String, default: '' },
  kabupaten_kota: { type: String, default: '' },
  titik_koordinat: { type: String, default: '' },
  link_maps: { type: String, default: '' },
  nama_pimpinan: { type: String, default: '' },
  kontak_mitra: { type: String, default: '' },
  status_kerjasama: { 
    type: String, 
    enum: [
      'Belum Ada', 
      'Proses Penjajakan (Siap MoU)', 
      'Memorandum of Understanding (MoU)', 
      'Memorandum of Agreement (MoA)', 
      'Implementation Arrangement (IA)'
    ], 
    default: 'Belum Ada' 
  },
  kuota_maksimal: { type: Number, default: 0 },
  fasilitas_khusus: { type: String, default: '' },
  
  // Status kelengkapan data
  is_lengkap: { type: Boolean, default: false },
  // Foto/Logo
  foto_kantor_desa: { type: String, default: '' },
  foto_kantor_bumdes: { type: String, default: '' },
  logo_mitra: { type: String, default: '' },
  
  // Dokumen Kerjasama
  file_mou: { type: String, default: '' },
  file_moa: { type: String, default: '' },
  file_ia: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.MitraKKL || mongoose.model('MitraKKL', MitraKKLSchema);
