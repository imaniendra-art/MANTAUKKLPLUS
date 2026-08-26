import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession, signToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function updateSessionCookie(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    nama_lengkap: user.nama_lengkap,
    nim_nidn: user.nim_nidn,
    nidn: user.nidn,
    role: user.role,
    isFirstLogin: user.isFirstLogin,
    konsentrasi: user.konsentrasi || "Manajemen SDM (Default)",
    program_studi: user.program_studi || "Manajemen (S1)",
    nomor_hp: user.nomor_hp || "",
  };
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function PATCH(req) {
  await dbConnect();
  
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak sah, silakan login" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (action === "update_konsentrasi") {
      const { konsentrasi } = body;
      user.konsentrasi = konsentrasi;
      await user.save();
      await updateSessionCookie(user);
      return NextResponse.json({ message: "Konsentrasi berhasil diperbarui" });
    }

    if (action === "update_nomor_hp") {
      const { nomor_hp } = body;
      user.nomor_hp = nomor_hp;
      await user.save();
      await updateSessionCookie(user);
      return NextResponse.json({ message: "Nomor HP berhasil diperbarui" });
    }

    if (action === "update_email") {
      const { email } = body;
      if (!email) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
      user.email = email;
      await user.save();
      await updateSessionCookie(user);
      return NextResponse.json({ message: "Email berhasil diperbarui" });
    }

    if (action === "update_username") {
      const { username } = body;
      if (!username) return NextResponse.json({ error: "Username wajib diisi" }, { status: 400 });
      user.nim_nidn = username;
      await user.save();
      await updateSessionCookie(user);
      return NextResponse.json({ message: "Username berhasil diperbarui" });
    }

    // Default: update password
    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan password baru wajib diisi" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Password lama salah" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.isFirstLogin = false;
    await user.save();
    
    await updateSessionCookie(user);

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return NextResponse.json({ error: "Email sudah digunakan oleh pengguna lain" }, { status: 400 });
      }
      if (error.keyPattern?.nim_nidn) {
        return NextResponse.json({ error: "Username/ID Pengguna sudah digunakan oleh pengguna lain" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
