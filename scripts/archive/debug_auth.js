import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.resolve('.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)="?(.*?)"?$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
} catch (e) {}

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String,
  password: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ nim_nidn: "2461201003" });
    if (!user) {
      console.log("User not found");
      process.exit(1);
    }
    
    console.log("Found user:", user.nama_lengkap);
    console.log("Stored hash:", user.password);
    
    const isValid = await bcrypt.compare("2461201003", user.password);
    console.log("isValid with '2461201003':", isValid);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
testAuth();
