import mongoose from 'mongoose';

const PenilaianSchema = new mongoose.Schema({
  pokja_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pokja', 
    required: true 
  },
  mahasiswa_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Penilaian Mentor Lapangan (20%)
  nilai_mentor_kelompok: { type: Number, default: 0 },
  nilai_mentor_individu: { type: Number, default: 0 },
  detail_mentor_kelompok: { type: Object, default: {} },
  detail_mentor_individu: { type: Object, default: {} },
  mentor_sudah_menilai: { type: Boolean, default: false },
  catatan_mentor: { type: String, default: '' },

  // Penilaian DPL (80%)
  nilai_dpl_kelompok: { type: Number, default: 0 },
  nilai_dpl_individu: { type: Number, default: 0 },
  detail_dpl_kelompok: { type: Object, default: {} },
  detail_dpl_individu: { type: Object, default: {} },
  dpl_sudah_menilai: { type: Boolean, default: false },
  catatan_dpl: { type: String, default: '' },

  // Kalkulasi Akhir
  nilai_akhir_angka: { type: Number, default: 0 },
  nilai_akhir_huruf: { type: String, default: '' },
  
  // Verifikasi Akhir oleh LPPM (Manual)
  status_kelulusan: { 
    type: String, 
    enum: ['menunggu', 'lulus', 'tidak_lulus'], 
    default: 'menunggu' 
  }
}, { timestamps: true });

// Ensure one grading document per student per pokja
PenilaianSchema.index({ pokja_id: 1, mahasiswa_id: 1 }, { unique: true });

// Avoid OverwriteModelError
if (mongoose.models.Penilaian) {
  delete mongoose.models.Penilaian;
}

export default mongoose.model('Penilaian', PenilaianSchema);
