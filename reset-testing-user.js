import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String,
  email: String,
  password: String,
  role: String,
  program_studi: String,
  konsentrasi: String,
  isFirstLogin: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetTestingUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    const nim = "246120100";
    const user = await User.findOne({ nim_nidn: nim });

    if (!user) {
      console.log('Testing user not found!');
      process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nim, salt);

    user.password = hashedPassword;
    user.isFirstLogin = true;
    await user.save();

    console.log('Success! Reset testing user password and isFirstLogin state.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting user:', error);
    process.exit(1);
  }
}

resetTestingUser();
