import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';
import MitraKKL from '@/models/MitraKKL';

export async function POST(req) {
  await dbConnect();
  try {
    const payload = await req.json();
    const { ketua_id, nama_pokja, anggota_ids, mitra_id } = payload;

    if (!ketua_id) {
      return NextResponse.json({ error: "Ketua ID wajib diisi" }, { status: 400 });
    }

    // Susun anggota
    let anggota = [];
    if (anggota_ids && Array.isArray(anggota_ids)) {
      anggota = anggota_ids.map(id => ({ user_id: id, status_undangan: 'menunggu' }));
    }
    
    // Ketua sudah ada di ketua_id, tidak perlu dimasukkan ke dalam array anggota

    const pokja = await Pokja.create({
      nama_pokja: nama_pokja || 'Pokja Baru',
      ketua_id,
      anggota,
      mitra_id: mitra_id || null,
      status_pokja: 'menunggu_persetujuan_lppm'
    });
    
    return NextResponse.json(pokja, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mhsId = searchParams.get('mhsId');
    const isAdmin = searchParams.get('admin');
    const pokjaId = searchParams.get('pokjaId');
    const dplId = searchParams.get('dplId');
    
    if (pokjaId) {
      const pokja = await Pokja.findById(pokjaId)
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp' })
        .populate({ path: 'mentor_id', select: 'nama_lengkap nomor_hp' })
        .populate('mitra_id');
      return NextResponse.json(pokja || null);
    }
    
    if (isAdmin === 'true') {
      const status = searchParams.get('status') || 'menunggu_persetujuan_lppm';
      const statusArray = status.includes(',') ? status.split(',') : [status];
      const pokjas = await Pokja.find({ status_pokja: { $in: statusArray } })
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn program_studi konsentrasi' })
        .populate({ path: 'dpl_id', select: 'nama_lengkap' })
        .populate({ path: 'mitra_id', select: 'nama_instansi' })
        .sort({ createdAt: -1 });
      return NextResponse.json(pokjas);
    }
    
    if (mhsId) {
      // Cari pokja dimana mahasiswa ini menjadi ketua atau anggota
      const pokja = await Pokja.findOne({
        $or: [
          { ketua_id: mhsId },
          { 'anggota.user_id': mhsId }
        ]
      })
      .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn' })
      .populate({ path: 'anggota.user_id', select: 'nama_lengkap nim_nidn' })
      .populate({ path: 'dpl_id', select: 'nama_lengkap nomor_hp' })
      .populate('mitra_id')
      .sort({ createdAt: -1 });
      return NextResponse.json(pokja || null);
    }
    
    if (dplId) {
      const pokjas = await Pokja.find({ dpl_id: dplId })
        .populate({ path: 'ketua_id', select: 'nama_lengkap nim_nidn' })
        .populate('mitra_id')
        .sort({ createdAt: -1 });
      return NextResponse.json(pokjas);
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
    const { id, dpl_id, status_pokja, catatan_lppm, action, mhs_id, mitra_id } = data;
    
    if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

    // Handle invite response (anggota accept/reject)
    if (action === 'respond_invite' && mhs_id && status_pokja) {
      const updated = await Pokja.findOneAndUpdate(
        { _id: id, 'anggota.user_id': mhs_id },
        { $set: { 'anggota.$.status_undangan': status_pokja } },
        { new: true }
      );
      return NextResponse.json(updated);
    }
    
    // Handle link join
    if (action === 'join_by_link' && mhs_id) {
      const targetPokja = await Pokja.findById(id);
      if (!targetPokja) return NextResponse.json({ error: "Kelompok tidak ditemukan" }, { status: 404 });
      
      if (targetPokja.anggota.length >= 4) {
        return NextResponse.json({ error: "Kelompok sudah penuh (maksimal 5 orang termasuk ketua)" }, { status: 400 });
      }
      
      const isAlreadyMember = targetPokja.anggota.find(a => a.user_id.toString() === mhs_id.toString());
      if (!isAlreadyMember) {
        targetPokja.anggota.push({
          user_id: mhs_id,
          status_undangan: 'bergabung',
        });
        await targetPokja.save();
      }
      
      return NextResponse.json({ success: true, pokja: targetPokja });
    }

    // Handle LPPM actions
    const updatePayload = {};
    if (status_pokja) updatePayload.status_pokja = status_pokja;
    if (dpl_id) updatePayload.dpl_id = dpl_id;
    if (catatan_lppm) updatePayload.catatan_lppm = catatan_lppm;
    if (mitra_id) updatePayload.mitra_id = mitra_id;

    const updated = await Pokja.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, strict: false }
    );
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
