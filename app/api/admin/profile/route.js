import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama_lengkap, email, password } = await req.json();

    await connectToDatabase();
    
    const adminUser = await User.findById(session.user.id);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    if (nama_lengkap) adminUser.nama_lengkap = nama_lengkap;
    if (email) adminUser.email = email;
    if (password && password.trim() !== '') {
      adminUser.password = await bcrypt.hash(password, 10);
    }

    await adminUser.save();

    return NextResponse.json({ message: 'Profil Admin berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
