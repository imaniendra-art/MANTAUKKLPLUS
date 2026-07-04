import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Absensi from '@/models/Absensi';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const mhsId = searchParams.get('mhsId');
  const tanggal = searchParams.get('tanggal'); // YYYY-MM-DD

  if (!mhsId) {
    return NextResponse.json({ error: "mhsId is required" }, { status: 400 });
  }

  try {
    const query = { mahasiswa_id: mhsId };
    if (tanggal) {
      query.tanggal = tanggal;
    }

    const absensi = await Absensi.find(query).sort({ tanggal: -1 });
    return NextResponse.json(absensi);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // Check if already checked in today
    const existing = await Absensi.findOne({
      mahasiswa_id: body.mahasiswa_id,
      tanggal: body.tanggal
    });

    if (existing) {
      return NextResponse.json({ error: "Anda sudah melakukan absen untuk hari ini." }, { status: 400 });
    }

    const newAbsensi = await Absensi.create(body);
    return NextResponse.json(newAbsensi, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Absensi ganda terdeteksi untuk hari ini." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
