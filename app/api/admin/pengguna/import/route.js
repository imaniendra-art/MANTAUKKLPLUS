import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  try {
    const payload = await req.json();
    
    if (!Array.isArray(payload.data)) {
      return NextResponse.json({ error: "Format data tidak valid, harus berupa array" }, { status: 400 });
    }

    const studentsToInsert = [];
    const errors = [];
    
    for (const [index, row] of payload.data.entries()) {
      try {
        const nim = row.nim?.toString().trim();
        const nama = row.nama?.trim() || `Mahasiswa ${nim}`;
        const prodi = row.prodi?.trim() || "Manajemen (S1)";

        if (!nim) {
          errors.push(`Baris ${index + 1}: NIM kosong.`);
          continue;
        }

        // Check if exists
        const existing = await User.findOne({ nim_nidn: nim });
        if (existing) {
          errors.push(`Baris ${index + 1}: NIM ${nim} sudah terdaftar.`);
          continue;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nim, salt);

        studentsToInsert.push({
          nama_lengkap: nama,
          nim_nidn: nim,
          email: `${nim}@student.stimiyapmi.ac.id`,
          password: hashedPassword,
          role: 'mahasiswa',
          program_studi: prodi,
          isFirstLogin: true,
        });

      } catch (err) {
        errors.push(`Baris ${index + 1}: Gagal memproses data (${err.message})`);
      }
    }

    if (studentsToInsert.length > 0) {
      await User.insertMany(studentsToInsert);
    }

    return NextResponse.json({
      message: "Proses import selesai.",
      inserted: studentsToInsert.length,
      errors: errors
    }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
