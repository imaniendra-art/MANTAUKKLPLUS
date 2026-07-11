import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  periode_aktif: {
    type: String,
    default: "Ganjil 2026/2027",
  },
  pendaftaran_buka: {
    type: Boolean,
    default: true,
  },
  pengisian_logbook_buka: {
    type: Boolean,
    default: true,
  },
  pengumpulan_laporan_buka: {
    type: Boolean,
    default: true,
  },
  daftar_periode: {
    type: [String],
    default: ["Ganjil 2026/2027"],
  }
}, { timestamps: true });

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
