import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Optional: Validasi real-time ke database
    await connectToDatabase();
    const existingUser = await User.findById(session.user.id).lean();

    if (!existingUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Return the latest user data
    const userData = {
      id: existingUser._id.toString(),
      email: existingUser.email,
      nama_lengkap: existingUser.nama_lengkap,
      nim_nidn: existingUser.nim_nidn,
      nidn: existingUser.nidn,
      role: existingUser.role,
      isFirstLogin: existingUser.isFirstLogin,
      konsentrasi: existingUser.konsentrasi,
      program_studi: existingUser.program_studi,
    };

    return NextResponse.json({ authenticated: true, user: userData });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
