import mongoose from 'mongoose';

const AbsensiSchema = new mongoose.Schema({
  mahasiswa_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pengajuan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pokja',
    required: true,
  },
  tanggal: {
    type: String, // format YYYY-MM-DD
    required: true,
  },
  waktu_checkin: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['hadir', 'izin', 'sakit'],
    default: 'hadir',
  },
  rencana_kegiatan: {
    type: String,
    required: function() { return this.status === 'hadir'; }, // Wajib jika hadir
  },
  alasan: {
    type: String,
    required: function() { return this.status !== 'hadir'; }, // Wajib jika izin/sakit
  },
  foto_bukti: {
    type: String,
    required: function() { return this.status !== 'hadir'; }, // Wajib upload foto surat sakit/izin
  }
}, { timestamps: true });

// Ensure only 1 absensi per student per day
AbsensiSchema.index({ mahasiswa_id: 1, tanggal: 1 }, { unique: true });

export default mongoose.models.Absensi || mongoose.model('Absensi', AbsensiSchema);
