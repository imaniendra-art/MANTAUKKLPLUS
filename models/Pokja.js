import mongoose from 'mongoose';

const PokjaSchema = new mongoose.Schema({
  nama_pokja: { type: String, required: false },
  ketua_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anggota: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status_undangan: { type: String, enum: ['menunggu', 'bergabung', 'ditolak'], default: 'menunggu' },
    nilai_rekomendasi_sistem: { type: Number, default: 0 },
    nilai_akhir_mutlak: { type: Number, default: 0 },
    catatan_evaluasi: { type: String, default: '' }
  }],
  mitra_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MitraKKL', required: false },
  dpl_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status_pokja: {
    type: String,
    enum: ['draft', 'menunggu_persetujuan_lppm', 'disetujui_lppm', 'berjalan', 'selesai', 'ditolak'],
    default: 'draft',
  },
  catatan_lppm: { type: String, default: '' },
  tanggal_mulai: { type: Date, required: false },
  tanggal_selesai: { type: Date, required: false },
  judul_proker: { type: String, default: '' },
  is_laporan_unlocked: { type: Boolean, default: false },
  
  // Dokumen Kelompok (Brankas Dokumen)
  file_surat_pengantar: { type: String, default: '' },
  file_surat_balasan: { type: String, default: '' }, // LOA
  file_surat_tugas: { type: String, default: '' },
  file_surat_selesai: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Pokja || mongoose.model('Pokja', PokjaSchema);
