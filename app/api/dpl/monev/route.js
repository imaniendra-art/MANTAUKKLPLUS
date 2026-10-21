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
      catatan: catatan || "",
      foto_url
    });

    return NextResponse.json({ success: true, monev: newMonev });
  } catch (error) {
    console.error("POST Monev error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { monev_id, pokja_id, jenis_kunjungan, tanggal_kunjungan, catatan, foto_url } = body;

    let query = {};
    if (monev_id) {
      query._id = monev_id;
    } else if (pokja_id && jenis_kunjungan) {
      query.pokja_id = pokja_id;
      query.jenis_kunjungan = jenis_kunjungan;
    } else {
      return NextResponse.json({ error: "Identitas data monev tidak lengkap" }, { status: 400 });
    }

    const existing = await Monev.findOne(query);
    if (!existing) {
      return NextResponse.json({ error: "Data kunjungan monev tidak ditemukan" }, { status: 404 });
    }

    if (String(existing.dpl_id) !== String(session.user.id)) {
      return NextResponse.json({ error: "Anda tidak berhak mengedit dokumentasi ini" }, { status: 403 });
    }

    if (tanggal_kunjungan) {
      existing.tanggal_kunjungan = new Date(tanggal_kunjungan);
    }
    if (catatan !== undefined) {
      existing.catatan = catatan;
    }
    if (foto_url) {
      existing.foto_url = foto_url;
    }

    await existing.save();

    return NextResponse.json({ success: true, monev: existing });
  } catch (error) {
    console.error("PUT Monev error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: "ID Monev wajib diisi" }, { status: 400 });
    }

    const existing = await Monev.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
    }

    if (String(existing.dpl_id) !== String(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Monev.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Dokumentasi kunjungan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Monev error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
