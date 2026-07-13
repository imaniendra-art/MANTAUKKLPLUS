import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String,
  email: String,
  password: String,
  role: String,
  isFirstLogin: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const adminUsername = "admin";
    const existingUser = await User.findOne({ email: "admin@stimi.ac.id" });

    if (existingUser) {
      console.log('Admin user already exists. Overwriting...');
      await User.deleteOne({ email: "admin@stimi.ac.id" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const newUser = await User.create({
      nama_lengkap: "Administrator",
      nim_nidn: adminUsername, // Gunakan nim_nidn sebagai field username untuk login
      email: "admin@stimi.ac.id",
      password: hashedPassword,
      role: 'admin',
      isFirstLogin: false,
    });

    console.log('Success! Created admin user:');
    console.log(`Username (NIM/NIDN): ${newUser.nim_nidn}`);
    console.log(`Password: admin123`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdminUser();
