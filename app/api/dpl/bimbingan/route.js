export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import MitraKKL from '@/models/MitraKKL';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import Proker from '@/models/Proker';

export async function GET(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const SystemSettings = (await import('@/models/SystemSettings')).default;
    const settings = await SystemSettings.findOne({});
    const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

    const bimbinganList = await Pokja.find({ 
      dpl_id: session.user.id, 
      status_pokja: { $in: ['disetujui_lppm', 'berjalan', 'selesai'] },
      periode: activePeriode
    })
      .populate('ketua_id', 'nama_lengkap nim_nidn nomor_hp email program_studi konsentrasi')
      .populate('anggota.user_id', 'nama_lengkap nim_nidn nomor_hp email program_studi konsentrasi')
      .populate('mitra_id')
      .populate('mentor_id', 'nama_lengkap nomor_hp email')
      .sort({ updatedAt: -1 })
      .lean();

    // Attach proker approval status
    for (let pokja of bimbinganList) {
      const prokers = await Proker.find({ pokja_id: pokja._id }).lean();
      pokja.total_proker = prokers.length;
      if (prokers.length > 0) {
        pokja.all_proker_approved = prokers.every(p => p.status === 'disetujui_dpl');
      } else {
        pokja.all_proker_approved = false;
      }
    }

    return NextResponse.json(bimbinganList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pengajuanId = (await req.json()).pengajuanId;
    if (!pengajuanId) return NextResponse.json({ error: "Missing pengajuanId" }, { status: 400 });

    const tanggalMulai = new Date();
    const tanggalSelesai = new Date();
    tanggalSelesai.setMonth(tanggalSelesai.getMonth() + 4);

    const pengajuan = await Pokja.findOneAndUpdate(
      { _id: pengajuanId, dpl_id: session.user.id },
      { 
        status_pokja: 'berjalan', // previously is_dpl_confirmed: true
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai
      },
      { new: true }
    );

    return NextResponse.json({ message: "Konfirmasi penyerahan berhasil", pengajuan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pengajuanId, nama_lengkap, nomor_hp, email } = await req.json();

    if (!pengajuanId || !nama_lengkap || !nomor_hp) {
      return NextResponse.json({ error: "Nama dan Nomor HP wajib diisi" }, { status: 400 });
    }

    let mentorUser = await User.findOne({ nim_nidn: nomor_hp });
    
    if (!mentorUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(nomor_hp, salt);

      mentorUser = await User.create({
        nama_lengkap,
        nim_nidn: nomor_hp, // Use phone number as ID/Username
        email: email || `${nomor_hp}@mentor.com`, // Fallback dummy email if not provided
        password: hashedPassword,
        role: 'mentor',
        nomor_hp,
        isFirstLogin: true
      });
    }

    const pengajuan = await Pokja.findOneAndUpdate(
      { _id: pengajuanId, dpl_id: session.user.id },
      { mentor_id: mentorUser._id },
      { new: true }
    ).populate('mentor_id', 'nama_lengkap nomor_hp email');

    return NextResponse.json({ message: "Mentor berhasil ditugaskan", pengajuan });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Nomor HP atau Email sudah terdaftar di sistem. Silakan gunakan yang lain." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
