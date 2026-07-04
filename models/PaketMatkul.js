import mongoose from 'mongoose';

const CpmkSchema = new mongoose.Schema({
  nama_cpmk: { type: String, required: true },
  indikator: [{ type: String }],
  saran_kegiatan: { type: String, default: "" },
});

const MatkulSchema = new mongoose.Schema({
  kode: { type: String, required: true },
  nama: { type: String, required: true },
  sks: { type: Number, required: true },
  dosen_pengampu: { type: String, default: "" },
  cpmk: [CpmkSchema],
});

const PaketMatkulSchema = new mongoose.Schema({
  nama_paket: { type: String },
  jenis_skema: { type: String },
  mata_kuliah: [MatkulSchema],
}, { timestamps: true });

export default mongoose.models.PaketMatkul || mongoose.model('PaketMatkul', PaketMatkulSchema);
