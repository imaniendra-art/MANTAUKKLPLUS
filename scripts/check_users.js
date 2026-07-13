const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/iman/Documents/GitHub/MANTAUKKLPLUS/.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.collection('users').find({}).toArray();
  users.forEach(u => console.log(`${u.nama_lengkap} - ${u.nim_nidn} - Role: ${u.role} - Tipe Admin: ${u.tipe_admin}`));
  process.exit();
}
check();
