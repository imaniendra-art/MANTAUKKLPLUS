import mongoose from 'mongoose';

const LogbookSchema = new mongoose.Schema({
  tipe_logbook: {
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
    required: function() { return this.tipe_logbook === 'individu'; }
  },
  proker_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proker',
    required: false, // Terutama digunakan untuk logbook pokja
  },
  tanggal: {
    type: Date,
    required: true,
  },
  deskripsi_kegiatan: {
    type: String,
    required: true,
  },
  bukti_kegiatan: { // untuk foto
    type: String,
  },
  bukti_link: { // untuk link (gdrive, figma, dll)
    type: String,
  },
  status_validasi: {
    type: String,
    enum: ['menunggu_mentor', 'divalidasi_mentor', 'divalidasi_dpl', 'revisi'],
    default: 'menunggu_mentor',
  },
  catatan_revisi: {
    type: String,
    default: "",
  },
}, { timestamps: true });

delete mongoose.models.Logbook;
export default mongoose.models.Logbook || mongoose.model('Logbook', LogbookSchema);
