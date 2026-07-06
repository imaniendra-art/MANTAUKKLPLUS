import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Logbook from '@/models/Logbook';
import Pokja from '@/models/Pokja';
import User from '@/models/User'; 

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    const pokjaId = searchParams.get('pokjaId');
    const tipe = searchParams.get('tipe'); // 'individu' | 'pokja'
    const role = searchParams.get('role');
    const userId = searchParams.get('userId'); 
    
    if (mhsId) {
      const query = { mahasiswa_id: mhsId };
      if (tipe) query.tipe_logbook = tipe;
      
      const logs = await Logbook.find(query)
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1, createdAt: -1 });
      return NextResponse.json(logs);
    }

    if (pokjaId && tipe === 'pokja') {
      const logs = await Logbook.find({ pokja_id: pokjaId, tipe_logbook: 'pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1, createdAt: -1 });
      return NextResponse.json(logs);
    }

    // LPPM: Tarik seluruh logbook untuk monitoring
    if (role === 'lppm') {
      const logs = await Logbook.find({})
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn program_studi' })
        .populate({ path: 'pokja_id', select: 'nama_pokja', populate: { path: 'mitra_id' } })
        .sort({ tanggal: -1 });
      return NextResponse.json(logs);
    }

    // Mentor: Tarik semua logbook (individu & pokja) yang menunggu validasi mentor
    if (role === 'mentor' && userId) {
      const pokjas = await Pokja.find({ mentor_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        status_validasi: 'menunggu_mentor',
        pokja_id: { $in: pokjaIds }
      })
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'pokja_id', select: 'nama_pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: 1 });
      return NextResponse.json(logs);
    }

    // Mentor Histori
    if (role === 'mentor_histori' && userId) {
      const pokjas = await Pokja.find({ mentor_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        status_validasi: { $in: ['divalidasi_mentor', 'divalidasi_dpl', 'revisi'] },
        pokja_id: { $in: pokjaIds }
      })
        .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'pokja_id', select: 'nama_pokja' })
        .populate({ path: 'proker_id', select: 'judul_proker' })
        .sort({ tanggal: -1 });
      return NextResponse.json(logs);
    }

    // DPL: Tarik logbook
    if (role === 'dpl' && userId) {
      const pokjas = await Pokja.find({ dpl_id: userId }).select('_id');
      const pokjaIds = pokjas.map(p => p._id);

      const logs = await Logbook.find({ 
        pokja_id: { $in: pokjaIds }
      })
      .populate({ path: 'mahasiswa_id', select: 'nama_lengkap nim_nidn' })
      .populate({ path: 'pokja_id', select: 'nama_pokja' })
      .populate({ path: 'proker_id', select: 'judul_proker' })
      .sort({ tanggal: 1 });

      return NextResponse.json(logs);
    }
    
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const newLog = await Logbook.create(data);
    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { id, status_validasi, catatan_revisi, rencana_target, uraian_kegiatan, hasil_output, kendala_solusi, bukti_link, bukti_kegiatan, ids } = data;
    
    // Bulk Update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      if (!status_validasi) {
        return NextResponse.json({ error: "Missing status_validasi for bulk update" }, { status: 400 });
      }
      const updated = await Logbook.updateMany(
        { _id: { $in: ids } },
        { $set: { status_validasi } }
      );
      return NextResponse.json({ success: true, count: updated.modifiedCount });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing Logbook ID" }, { status: 400 });
    }
    
    let updateData = {};
    if (status_validasi) updateData.status_validasi = status_validasi;
    if (catatan_revisi !== undefined) updateData.catatan_revisi = catatan_revisi;
    if (rencana_target) updateData.rencana_target = rencana_target;
    if (uraian_kegiatan) updateData.uraian_kegiatan = uraian_kegiatan;
    if (hasil_output) updateData.hasil_output = hasil_output;
    if (kendala_solusi !== undefined) updateData.kendala_solusi = kendala_solusi;
    if (bukti_link !== undefined) updateData.bukti_link = bukti_link;
    if (bukti_kegiatan) updateData.bukti_kegiatan = bukti_kegiatan;
    
    const updated = await Logbook.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
