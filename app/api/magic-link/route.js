import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MagicLink from '@/models/MagicLink';
import Logbook from '@/models/Logbook';

// Helper to generate random token
const generateToken = () => {
  return 'kkl-' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
};

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { dpl_id, pokja_id, logbook_ids } = data;

    if (!dpl_id || !pokja_id || !logbook_ids || !logbook_ids.length) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Berlaku 7 hari

    // Buat Magic Link
    const magicLink = await MagicLink.create({
      token,
      dpl_id,
      pokja_id,
      logbook_ids,
      expiresAt
    });

    // Ubah status logbook menjadi menunggu_mentor
    await Logbook.updateMany(
      { _id: { $in: logbook_ids } },
      { $set: { status_validasi: 'menunggu_mentor' } }
    );

    return NextResponse.json({ token, success: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { token } = data;

    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 400 });
    }

    const magicLink = await MagicLink.findOne({ token, status: 'active' });
    
    if (!magicLink) {
      return NextResponse.json({ error: "Link sudah kadaluarsa atau sudah digunakan" }, { status: 404 });
    }

    if (new Date() > new Date(magicLink.expiresAt)) {
      magicLink.status = 'used';
      await magicLink.save();
      return NextResponse.json({ error: "Link sudah kadaluarsa" }, { status: 400 });
    }

    // Setujui logbook
    await Logbook.updateMany(
      { _id: { $in: magicLink.logbook_ids } },
      { $set: { status_validasi: 'selesai' } }
    );

    // Tandai token used
    magicLink.status = 'used';
    await magicLink.save();

    return NextResponse.json({ success: true, count: magicLink.logbook_ids.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Token diperlukan" }, { status: 400 });
    }

    const magicLink = await MagicLink.findOne({ token })
      .populate({
        path: 'logbook_ids',
        populate: [
          { path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' },
          { path: 'proker_id', select: 'judul_proker' }
        ]
      })
      .populate({ path: 'dpl_id', select: 'nama_lengkap' })
      .populate({ 
        path: 'pokja_id', 
        select: 'nama_pokja mitra_id',
        populate: {
          path: 'mitra_id',
          select: 'desa_kelurahan kecamatan kabupaten_kota'
        }
      });

    if (!magicLink) {
      return NextResponse.json({ error: "Link tidak valid" }, { status: 404 });
    }

    return NextResponse.json(magicLink);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
