import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Proker from '@/models/Proker';
import Pokja from '@/models/Pokja';

export async function POST(req) {
  await dbConnect();
  try {
    const payload = await req.json();
    const { pokja_id, judul_proker, deskripsi, target_dampak, jenis_proker, pic_id, tanggal_mulai, tanggal_selesai } = payload;

    if (!pokja_id || !judul_proker || !jenis_proker || !pic_id || !tanggal_mulai || !tanggal_selesai || (Array.isArray(pic_id) && pic_id.length === 0)) {
      return NextResponse.json({ error: "Pokja ID, Judul, Jenis, PIC, dan Tanggal wajib diisi" }, { status: 400 });
    }

    const proker = await Proker.create({
      pokja_id,
      judul_proker,
      deskripsi,
      target_dampak,
      jenis_proker,
      pic_id,
      tanggal_mulai,
      tanggal_selesai,
      status_pelaksanaan: 'Belum Dimulai',
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
      const proker = await Proker.find({ pokja_id: pokjaId })
        .populate('pic_id', 'nama_lengkap')
        .sort({ createdAt: -1 });
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
        .populate('pic_id', 'nama_lengkap')
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
    const { id, status, catatan_revisi, status_pelaksanaan, judul_proker, deskripsi, target_dampak, jenis_proker, pic_id, tanggal_mulai, tanggal_selesai } = data;
    
    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    const updatePayload = {};
    if (status) updatePayload.status = status;
    if (catatan_revisi !== undefined) updatePayload.catatan_revisi = catatan_revisi;
    if (status_pelaksanaan) updatePayload.status_pelaksanaan = status_pelaksanaan;
    if (judul_proker) updatePayload.judul_proker = judul_proker;
    if (deskripsi) updatePayload.deskripsi = deskripsi;
    if (target_dampak) updatePayload.target_dampak = target_dampak;
    if (jenis_proker) updatePayload.jenis_proker = jenis_proker;
    if (pic_id) updatePayload.pic_id = pic_id;
    if (tanggal_mulai) updatePayload.tanggal_mulai = tanggal_mulai;
    if (tanggal_selesai) updatePayload.tanggal_selesai = tanggal_selesai;

    // Jika mahasiswa mengedit isi proker (ditandai dengan adanya field judul_proker dll), 
    // maka kembalikan statusnya ke 'usulan' agar direview ulang oleh DPL.
    // (DPL tidak mengirimkan judul_proker saat melakukan review)
    if (judul_proker || deskripsi || target_dampak) {
      updatePayload.status = 'usulan';
    }

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

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    await Proker.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
