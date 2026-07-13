import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MitraKKL from '@/models/MitraKKL';
import PosisiKKL from '@/models/PosisiKKL'; // for cascade delete

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const isPublic = searchParams.get('public') === 'true';
    const isAvailableOnly = searchParams.get('available') === 'true';

    const mitra = await MitraKKL.aggregate([
      {
        $lookup: {
          from: "posisimagangs",
          localField: "_id",
          foreignField: "mitra_id",
          as: "posisi_list"
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    let finalMitra = mitra;

    if (isAvailableOnly) {
      const Pokja = (await import('@/models/Pokja')).default;
      const activePokjas = await Pokja.find({ 
        status_pokja: { $ne: 'ditolak' },
        mitra_id: { $exists: true, $ne: null }
      }).select('mitra_id');
      
      const usedMitraIds = activePokjas.map(p => p.mitra_id.toString());
      finalMitra = finalMitra.filter(m => !usedMitraIds.includes(m._id.toString()));
    }

    if (isPublic) {
      // In the new POKJA system, groups apply to Mitra directly. 
      // For now, we will return all positions without strict quota filtering until the new quota system is designed.
      const filteredMitra = finalMitra.map(m => {
        // Just return all positions for public view for now
        return m;
      }).filter(m => m.posisi_list.length > 0);

      return NextResponse.json(filteredMitra);
    }

    return NextResponse.json(finalMitra);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const newMitra = await MitraKKL.create(data);
    return NextResponse.json(newMitra, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: "ID Mitra diperlukan" }, { status: 400 });

    const updatedMitra = await MitraKKL.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedMitra) return NextResponse.json({ error: "Mitra tidak ditemukan" }, { status: 404 });

    return NextResponse.json(updatedMitra);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID Mitra diperlukan" }, { status: 400 });

    const deletedMitra = await MitraKKL.findByIdAndDelete(id);
    if (!deletedMitra) return NextResponse.json({ error: "Mitra tidak ditemukan" }, { status: 404 });

    // Cascade delete PosisiKKL
    await PosisiKKL.deleteMany({ mitra_id: id });

    return NextResponse.json({ message: "Mitra dan posisi terkait berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
