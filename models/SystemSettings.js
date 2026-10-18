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
  },
  kaprodi_nama: {
    type: String,
    default: "Dr Anwar, S.Ag.,M.Ag",
  },
  kaprodi_nip: {
    type: String,
    default: "198001012005011001",
  },
  ketua_lppm_nama: {
    type: String,
    default: "Andi Arwinda Wildam, S.E.,M.M",
  },
  ketua_lppm_nidn: {
    type: String,
    default: "0153770671230313",
  },
  ketua_lppm_ttd: {
    type: String,
    default: "/ttd-lppm.png",
  },
  kaprodi_ttd: {
    type: String,
    default: "",
  }
}, { timestamps: true });

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
