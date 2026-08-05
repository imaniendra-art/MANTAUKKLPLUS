import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MONGODB_URI is fetched inside connectToDatabase to avoid build-time errors


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Fungsi auto-seed untuk membuat akun jika database kosong
async function seedInitialUsers() {
  try {
    const { default: User } = await import('@/models/User');
    
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('>>> MENGHIDUPKAN SISTEM: Tabel User kosong. Menjalankan auto-seed...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const seedUsers = [
        {
          role: 'admin',
          email: 'admin@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Admin Pusat STIMI',
          nim_nidn: 'ADMIN-STIMI-001'
        },
        {
          role: 'mahasiswa',
          email: 'mahasiswa@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Mahasiswa Tester',
          nim_nidn: '19201011'
        },
        {
          role: 'dpl',
          email: 'dpl@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Bapak DPL',
          nim_nidn: 'DPL-09123456'
        }
      ];

      await User.insertMany(seedUsers);
      console.log('>>> AUTO-SEED BERHASIL: 3 akun dasar (Admin, Mahasiswa, DPL) siap digunakan.');
    }
  } catch (err) {
    console.error('Error saat melakukan auto-seed User:', err);
  }
}


async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // Jalankan seeding segera setelah MongoDB terkoneksi
      await seedInitialUsers();
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
