require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const URI = process.env.MONGODB_URI;

// Import user model from mongoose, avoiding Next.js specific imports
const userSchema = new mongoose.Schema({
  nama_lengkap: { type: String, required: true },
  nim_nidn: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isFirstLogin: { type: Boolean, default: true },
});

// Avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

const students = [
  { nim: "2361201010", nama: "MUH PUTRA PRATAMA" },
  { nim: "2361201011", nama: "MUH TAHIR" },
  { nim: "2361201012", nama: "MUH FADHLUR ROCHMAN" },
  { nim: "2361201013", nama: "NUR AMALIA PUTRI" },
  { nim: "2361201014", nama: "REZKY AULIA APRILITA" },
];

async function insertStudents() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB.");

    let addedCount = 0;
    
    for (const student of students) {
      // Check if already exists
      const existingUser = await User.findOne({ nim_nidn: student.nim });
      if (existingUser) {
        console.log(`User ${student.nim} already exists. Skipping.`);
        continue;
      }

      // Hash password (using NIM as default password)
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(student.nim, salt);

      const email = `${student.nim}@student.unismuh.ac.id`;

      await User.create({
        nama_lengkap: student.nama.trim(),
        nim_nidn: student.nim,
        email: email,
        password: hashedPassword,
        role: 'mahasiswa',
        isFirstLogin: true,
      });
      
      console.log(`Added: ${student.nim} - ${student.nama.trim()}`);
      addedCount++;
    }

    console.log(`Insertion complete. Added ${addedCount} new students.`);
    process.exit(0);
  } catch (error) {
    console.error("Error inserting students:", error);
    process.exit(1);
  }
}

insertStudents();
