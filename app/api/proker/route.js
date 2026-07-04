import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Proker from '@/models/Proker';
import Pokja from '@/models/Pokja';

export async function POST(req) {
  await dbConnect();
  try {
    const payload = await req.json();
    const { pokja_id, judul_proker, deskripsi, target_dampak } = payload;

    if (!pokja_id || !judul_proker) {
      return NextResponse.json({ error: "Pokja ID dan Judul wajib diisi" }, { status: 400 });
    }

    const proker = await Proker.create({
      pokja_id,
      judul_proker,
      deskripsi,
      target_dampak,
      status: 'usulan'
    });
    
    return NextResponse.json(proker, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const pokjaId = searchParams.get('pokjaId');
    const dplId = searchParams.get('dplId');
    
    if (pokjaId) {
      const proker = await Proker.find({ pokja_id: pokjaId }).sort({ createdAt: -1 });
      return NextResponse.json(proker);
    }

    if (dplId) {
      // DPL melihat proker dari pokja yang dia bimbing
      const pokjas = await Pokja.find({ dpl_id: dplId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);
      
      const prokers = await Proker.find({ pokja_id: { $in: pokjaIds } })
        .populate({
          path: 'pokja_id',
          select: 'nama_pokja ketua_id',
          populate: { path: 'ketua_id', select: 'nama_lengkap' }
        })
        .sort({ createdAt: -1 });
      return NextResponse.json(prokers);
    }
    
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { id, status, catatan_revisi } = data;
    
    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (catatan_revisi !== undefined) updatePayload.catatan_revisi = catatan_revisi;

    const updated = await Proker.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
