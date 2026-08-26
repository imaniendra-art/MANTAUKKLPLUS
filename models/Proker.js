import mongoose from 'mongoose';

const ProkerSchema = new mongoose.Schema({
  pokja_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokja', required: true },
  judul_proker: { type: String, required: true },
  deskripsi: { type: String, required: true },
  target_dampak: { type: String, required: true },
  jenis_proker: { type: String, enum: ['Utama', 'Pendukung'], required: true },
  pic_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  tanggal_mulai: { type: Date, required: true },
  tanggal_selesai: { type: Date, required: true },
  status_pelaksanaan: {
    type: String,
    enum: ['Belum Dimulai', 'Berjalan', 'Selesai'],
    default: 'Belum Dimulai'
  },
  status: {
    type: String,
    enum: ['usulan', 'disetujui_dpl', 'revisi', 'selesai'],
    default: 'usulan'
  },
  catatan_revisi: { type: String, default: '' },
}, { timestamps: true });

// Indeks untuk pengambilan cepat daftar proker pokja & PIC
ProkerSchema.index({ pokja_id: 1, status: 1 });
ProkerSchema.index({ pic_id: 1 });

delete mongoose.models.Proker;
export default mongoose.models.Proker || mongoose.model('Proker', ProkerSchema);
