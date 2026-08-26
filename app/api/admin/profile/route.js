import { NextResponse } from 'next/server';
import { getServerSession, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nama_lengkap, email, password } = await req.json();

    await connectToDatabase();
    
    const adminUser = await User.findById(session.user.id);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    if (nama_lengkap) {
      adminUser.nama_lengkap = nama_lengkap.trim();
    }
    
    if (email && email.trim() !== '') {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: adminUser._id } });
      if (existing) {
        return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain' }, { status: 400 });
      }
      adminUser.email = cleanEmail;
    }

    if (password && password.trim() !== '') {
      adminUser.password = await bcrypt.hash(password, 10);
    }

    await adminUser.save();

    // Update JWT session cookie
    const payload = {
      id: adminUser._id.toString(),
      email: adminUser.email,
      nama_lengkap: adminUser.nama_lengkap,
      nim_nidn: adminUser.nim_nidn,
      nidn: adminUser.nidn,
      role: adminUser.role,
      tipe_admin: adminUser.tipe_admin,
      isFirstLogin: adminUser.isFirstLogin,
      konsentrasi: adminUser.konsentrasi || "Manajemen SDM (Default)",
      program_studi: adminUser.program_studi || "Manajemen (S1)",
      nomor_hp: adminUser.nomor_hp || "",
    };

    const token = signToken(payload);
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({ 
      message: 'Profil Admin berhasil diperbarui',
      user: payload 
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email sudah terdaftar pada pengguna lain' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

