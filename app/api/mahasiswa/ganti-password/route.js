import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, konsentrasi, kegiatan, nomor_hp } = await req.json();

    if (!currentPassword || !newPassword || !konsentrasi || !kegiatan || !nomor_hp) {
      return NextResponse.json({ message: 'Data tidak lengkap (Password, Konsentrasi, Kegiatan & No HP wajib diisi)' }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Password saat ini salah' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id, 
      {
        password: hashedPassword,
        konsentrasi: konsentrasi,
        kegiatan: kegiatan,
        nomor_hp: nomor_hp,
        isFirstLogin: false
      },
      { new: true }
    );

    console.log("Status update:", updatedUser);

    return NextResponse.json({ message: 'Password berhasil diubah' }, { status: 200 });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
