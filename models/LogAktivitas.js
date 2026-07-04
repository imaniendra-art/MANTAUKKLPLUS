import mongoose from 'mongoose';

const LogAktivitasSchema = new mongoose.Schema({
  mahasiswa_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nama_mahasiswa: {
    type: String,
    required: true,
  },
  aktivitas: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['menunggu', 'disetujui', 'ditolak', 'info'],
    default: 'info',
  }
}, { timestamps: true });

export default mongoose.models.LogAktivitas || mongoose.model('LogAktivitas', LogAktivitasSchema);
