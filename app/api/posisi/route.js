import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PosisiKKL from '@/models/PosisiKKL';

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const mitraId = searchParams.get('mitraId');
    const posisiId = searchParams.get('posisiId');
    
    if (posisiId) {
      const posisi = await PosisiKKL.findById(posisiId).populate('mitra_id', 'nama_instansi jenis_skema alamat deskripsi');
      if (!posisi) {
        return NextResponse.json({ error: "Posisi tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json(posisi);
    }

    let query = {};
    if (mitraId) {
      query.mitra_id = mitraId;
    }

    const posisi = await PosisiKKL.find(query)
      .populate('mitra_id', 'nama_instansi jenis_skema alamat')
      .sort({ createdAt: -1 });

    const isPublic = searchParams.get('public') === 'true';
    if (isPublic) {
      const Pokja = (await import('@/models/Pokja')).default;
      const pokjas = await Pokja.find({ 
        status_pokja: { $in: ['disetujui_admin', 'berjalan', 'selesai'] }
      });

      // Bypassing strict posisi quota for now because Pokja binds to Mitra, not Posisi
      const availablePosisi = posisi;

      return NextResponse.json(availablePosisi);
    }
      
    return NextResponse.json(posisi);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const newPosisi = await PosisiKKL.create(data);
    return NextResponse.json(newPosisi, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: "ID Posisi diperlukan" }, { status: 400 });

    const updatedPosisi = await PosisiKKL.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPosisi) return NextResponse.json({ error: "Posisi tidak ditemukan" }, { status: 404 });

    return NextResponse.json(updatedPosisi);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID Posisi diperlukan" }, { status: 400 });

    const deletedPosisi = await PosisiKKL.findByIdAndDelete(id);
    if (!deletedPosisi) return NextResponse.json({ error: "Posisi tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ message: "Posisi berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
