import mongoose from 'mongoose';

const LaporanDplSchema = new mongoose.Schema({
  dpl_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  proker_utama: { 
    type: String, 
    default: '' 
  },
  proker_penunjang: { 
    type: String, 
    default: '' 
  },
  evaluasi_kinerja: { 
    type: String, 
    default: '' 
  },
  evaluasi_prokers: {
    type: Map,
    of: String,
    default: {}
  },
  kendala_lapangan: { 
    type: String, 
    default: '' 
  },
  solusi_lapangan: { 
    type: String, 
    default: '' 
  },
  latar_belakang: {
    type: String,
    default: ''
  },
  tujuan_pembimbingan: {
    type: String,
    default: ''
  },
  jadwal_pembekalan: {
    type: String,
    default: ''
  },
  jadwal_monitoring_1: {
    type: String,
    default: ''
  },
  jadwal_monitoring_2: {
    type: String,
    default: ''
  },
  jadwal_penarikan: {
    type: String,
    default: ''
  },
  kesimpulan: { 
    type: String, 
    default: '' 
  },
  saran: { 
    type: String, 
    default: '' 
  },

  status: {
    type: String,
    enum: ['draft', 'submitted', 'revisi', 'disetujui'],
    default: 'draft',
  },
  qr_code_validasi: {
    type: String,
    default: ''
  },
  disetujui_oleh: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  tanggal_disetujui: {
    type: Date
  }
}, { timestamps: true });

// Hapus model lama dari cache agar enum baru terbaca di Next.js dev server
if (mongoose.models.LaporanDpl) {
  delete mongoose.models.LaporanDpl;
}

export default mongoose.model('LaporanDpl', LaporanDplSchema);
