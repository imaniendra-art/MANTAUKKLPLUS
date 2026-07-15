export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import Monev from '@/models/Monev';
import { getServerSession } from "@/lib/auth";


export async function GET(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const SystemSettings = (await import('@/models/SystemSettings')).default;
    const settings = await SystemSettings.findOne({});
    const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";

    const pokjas = await Pokja.find({ 
      dpl_id: session.user.id, 
      status_pokja: { $in: ['disetujui_admin', 'berjalan', 'selesai'] },
      periode: activePeriode
    })
      .populate('mitra_id', 'nama_mitra wilayah')
      .populate('ketua_id', 'nama_lengkap')
      .lean();

    // Fetch monev for each pokja
    for (let p of pokjas) {
      const monevs = await Monev.find({ pokja_id: p._id }).lean();
      p.monev = monevs;
    }

    return NextResponse.json({ pokjas });
  } catch (error) {
    console.error("GET Monev error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pokja_id, jenis_kunjungan, tanggal_kunjungan, catatan, foto_url } = body;

    if (!pokja_id || !jenis_kunjungan || !tanggal_kunjungan || !foto_url) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Check if the visit type already exists for this pokja
    const existing = await Monev.findOne({ pokja_id, jenis_kunjungan });
    if (existing) {
      return NextResponse.json({ error: `Kunjungan ${jenis_kunjungan} sudah pernah dilaporkan.` }, { status: 400 });
    }

    const newMonev = await Monev.create({
      dpl_id: session.user.id,
      pokja_id,
      jenis_kunjungan,
      tanggal_kunjungan: new Date(tanggal_kunjungan),
      catatan,
      foto_url
    });

    return NextResponse.json({ success: true, monev: newMonev });
  } catch (error) {
    console.error("POST Monev error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
