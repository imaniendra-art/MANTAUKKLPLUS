import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define Minimal Schema manually so we don't need to import Next.js specific things if they fail
const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String,
  email: String,
  password: String,
  role: String,
  program_studi: String,
  konsentrasi: String,
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedTestingUser() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const nim = "246120100";
    const existingUser = await User.findOne({ nim_nidn: nim });

    if (existingUser) {
      console.log('Testing user already exists. Overwriting...');
      await User.deleteOne({ nim_nidn: nim });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nim, salt);

    const newUser = await User.create({
      nama_lengkap: "Muhammad Budi",
      nim_nidn: nim,
      email: "246120100@student.stimiyapmi.ac.id",
      password: hashedPassword,
      role: "mahasiswa",
      program_studi: "Manajemen (S1)",
      konsentrasi: "SDM",
      isFirstLogin: true,
    });

    console.log('Success! Created testing user:');
    console.log(newUser);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
}

seedTestingUser();
