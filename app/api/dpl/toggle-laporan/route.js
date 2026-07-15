export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

import { getServerSession } from "@/lib/auth";


export async function PATCH(req) {
  await dbConnect();
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'dpl') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pengajuanId, isUnlocked } = await req.json();
    
    if (!pengajuanId) {
      return NextResponse.json({ error: "Missing pengajuanId" }, { status: 400 });
    }

    const Pokja = (await import('@/models/Pokja')).default;
    const pengajuan = await Pokja.findOneAndUpdate(
      { _id: pengajuanId, dpl_id: session.user.id },
      { is_laporan_unlocked: isUnlocked },
      { new: true }
    );

    if (!pengajuan) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Status laporan berhasil diubah", 
      is_laporan_unlocked: pengajuan.is_laporan_unlocked 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
