import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String,
  role: String,
  isFirstLogin: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

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
} catch (e) {
  console.log('No .env.local found or error parsing');
}

import bcrypt from 'bcryptjs';

async function checkDpl() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: 'dpl' }).lean();
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkDpl();
