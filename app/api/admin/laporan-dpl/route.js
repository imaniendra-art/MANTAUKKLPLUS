import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import LaporanDpl from '@/models/LaporanDpl';
import User from '@/models/User';
import Proker from '@/models/Proker';
import Pokja from '@/models/Pokja';
import MitraKKL from '@/models/MitraKKL';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const laporan = await LaporanDpl.find({ status: { $ne: 'draft' } })
      .populate('dpl_id', 'nama_lengkap nim_nidn email')
      .sort({ updatedAt: -1 })
      .lean();

    const prokerIds = [];
    laporan.forEach(l => {
      if (l.evaluasi_prokers) {
        prokerIds.push(...Object.keys(l.evaluasi_prokers));
      }
    });

    const prokers = await Proker.find({ _id: { $in: prokerIds } }).lean();
    const prokerMap = {};
    prokers.forEach(p => { prokerMap[p._id.toString()] = p.judul_proker });

    // Fetch Pokjas for these DPLs
    const dplIds = laporan.map(l => l.dpl_id?._id).filter(Boolean);
    const pokjas = await Pokja.find({ dpl_id: { $in: dplIds } })
      .populate('mitra_id', 'nama_instansi')
      .populate('ketua_id', 'nama_lengkap')
      .lean();

    const pokjaByDpl = {};
    pokjas.forEach(p => {
       const dplIdStr = p.dpl_id.toString();
       if (!pokjaByDpl[dplIdStr]) pokjaByDpl[dplIdStr] = [];
       pokjaByDpl[dplIdStr].push({
          nama_pokja: p.nama_pokja || 'Belum ada nama',
          ketua: p.ketua_id?.nama_lengkap || 'Belum ada ketua',
          mitra: p.mitra_id?.nama_instansi || 'Belum ada mitra'
       });
    });

    const laporansWithProkers = laporan.map(l => {
      const evaluasi_prokers_mapped = {};
      if (l.evaluasi_prokers) {
        for (const [key, val] of Object.entries(l.evaluasi_prokers)) {
          evaluasi_prokers_mapped[prokerMap[key] || key] = val;
        }
      }
      const pokja_info = pokjaByDpl[l.dpl_id?._id?.toString()] || [];
      return { ...l, evaluasi_prokers_mapped, pokja_info };
    });

    return NextResponse.json(laporansWithProkers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const laporan = await LaporanDpl.findById(id);
    if (!laporan) {
      return NextResponse.json({ error: "Laporan tidak ditemukan" }, { status: 404 });
    }

    if (action === 'approve') {
      // Generate QR Code payload / string. Could be a URL to verification page
      const uniqueHash = crypto.randomBytes(16).toString('hex');
      const validationString = `VALIDATED-${laporan._id}-${uniqueHash}`;
      
      laporan.status = 'disetujui';
      laporan.qr_code_validasi = validationString;
      laporan.disetujui_oleh = session.user.id;
      laporan.tanggal_disetujui = new Date();
    } else if (action === 'reject') {
      laporan.status = 'revisi';
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await laporan.save();
    return NextResponse.json({ message: "Status laporan berhasil diperbarui", laporan });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
