import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nama_lengkap: {
    type: String,
    required: [true, 'Nama lengkap wajib diisi'],
  },
  nim_nidn: {
    type: String,
    required: [true, 'NIM/NIDN wajib diisi'],
    unique: true,
  },
  nidn: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password wajib diisi'],
  },
  role: {
    type: String,
    enum: ['mahasiswa', 'dpl', 'admin', 'mentor'],
    required: [true, 'Role wajib diisi'],
  },
  tipe_admin: {
    type: String,
    enum: ['lppm', 'prodi', 'fakultas', 'superadmin', 'lainnya'],
    required: false,
    default: 'lppm' // Defaulting existing admins to lppm initially, but they are all 'admin' role now
  },
  program_studi: {
    type: String,
    required: false,
  },
  konsentrasi: {
    type: String,
    required: false,
  },
  kegiatan: {
    type: String,
    required: false,
  },
  nomor_hp: {
    type: String,
    required: false,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export default mongoose.model('User', UserSchema);
