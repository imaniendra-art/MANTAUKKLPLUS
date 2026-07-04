import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Load .env.local
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

import User from './models/User.js';

async function resetEnvironment() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Define the ones to keep
    const keepNims = ["2461201001", "2461201002", "2461201003", "riswan"];
    
    // Delete all users EXCEPT the ones we want to keep
    // Uncomment the below lines if you actually want to wipe other users
    // const deleteResult = await User.deleteMany({ nim_nidn: { $nin: keepNims } });
    // console.log(`Deleted ${deleteResult.deletedCount} other users.`);
    
    // Reset passwords for the ones we keep
    const users = await User.find({ nim_nidn: { $in: keepNims } });
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.nim_nidn, salt);
      user.password = hashedPassword;
      user.isFirstLogin = true;
      await user.save();
      console.log(`[RESET] ${user.role}: ${user.nama_lengkap} (${user.nim_nidn})`);
    }

    console.log('\nBerhasil! 3 akun Mahasiswa & 1 DPL telah di-reset ke password default (NIM/NIDN).');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetEnvironment();
