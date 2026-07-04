import mongoose from 'mongoose';

const MitraKKLSchema = new mongoose.Schema({
  nama_instansi: { type: String, required: true },
  alamat: { type: String, required: true },
  jenis_skema: { type: String, enum: ['corporate', 'wirausaha', 'Pemerintahan'], required: true },
  file_mou_url: { type: String, required: false },
  deskripsi_mitra: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.MitraKKL || mongoose.model('MitraKKL', MitraKKLSchema);
