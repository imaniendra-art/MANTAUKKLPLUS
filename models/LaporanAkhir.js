import mongoose from 'mongoose';

const LaporanAkhirSchema = new mongoose.Schema({
  tipe_laporan: {
    type: String,
    enum: ['individu', 'pokja'],
    required: true,
  },
  pokja_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pokja',
    required: true,
  },
  mahasiswa_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.tipe_laporan === 'individu'; }
  },
  bab1_pendahuluan: { type: String, default: '' },
  bab2_profil: { type: String, default: '' },
  bab3_aktivitas: { type: String, default: '' },
  bab4_permasalahan: { type: String, default: '' },
  bab5_kesimpulan: { type: String, default: '' },
  bab6_refleksi: { type: String, default: '' },
  file_laporan: { type: String, default: '' }, // Bisa berupa PDF upload
  catatan_dpl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'revisi', 'disetujui'],
    default: 'draft',
  }
}, { timestamps: true });

// Hapus model lama dari cache agar enum baru terbaca di Next.js dev server
if (mongoose.models.LaporanAkhir) {
  delete mongoose.models.LaporanAkhir;
}

export default mongoose.model('LaporanAkhir', LaporanAkhirSchema);
