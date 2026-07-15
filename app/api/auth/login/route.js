import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email/NIM dan password wajib diisi" }, { status: 400 });
    }

    await connectToDatabase();
    
    const identifier = email.trim();
    const query = {
      $or: [
        { nim_nidn: identifier },
        { email: identifier },
        { nidn: identifier },
        { nomor_hp: identifier }
      ]
    };
    
    const user = await User.findOne(query).lean();
    if (!user) {
      return NextResponse.json({ error: "Akun tidak terdaftar" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

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
    };

    const token = signToken(payload);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, user: payload });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
