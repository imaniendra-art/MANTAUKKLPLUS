import mongoose from 'mongoose';

const ProkerSchema = new mongoose.Schema({
  pokja_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokja', required: true },
  judul_proker: { type: String, required: true },
  deskripsi: { type: String, required: true },
  target_dampak: { type: String, required: true },
  status: {
    type: String,
    enum: ['usulan', 'disetujui_dpl', 'revisi', 'selesai'],
    default: 'usulan'
  },
  catatan_revisi: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Proker || mongoose.model('Proker', ProkerSchema);
