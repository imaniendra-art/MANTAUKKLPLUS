import mongoose from 'mongoose';

const PosisiKKLSchema = new mongoose.Schema({
  mitra_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MitraKKL', required: true },
  nama_posisi: { type: String, required: true },
  konsentrasi: { type: String, enum: ['SDM', 'Keuangan', 'Pemasaran', 'Pengembangan Bisnis'], required: true },
  kuota: { type: Number, required: true, default: 1 },
  deskripsi_pekerjaan: { type: String, required: false },
  kriteria_kandidat: { type: String, required: false },
  sistem_kerja: { type: String, enum: ['WFO', 'WFH', 'Hybrid'], default: 'WFO' }
}, { timestamps: true });

export default mongoose.models.PosisiKKL || mongoose.model('PosisiKKL', PosisiKKLSchema);
