import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from "@/lib/auth";


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
      return NextResponse.json({ message: "Konsentrasi berhasil diperbarui" });
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

    return NextResponse.json({ message: "Password berhasil diubah" });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
