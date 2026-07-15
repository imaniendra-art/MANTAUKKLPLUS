import { NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth";

import connectToDatabase from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch pokja that have names and are in 'draft' or 'menunggu_persetujuan_admin' status
    // Because if it's already running, it might not accept members (or maybe they all do, but let's just get draft ones)
    // Actually, just fetch all that have a nama_pokja. 
    const availablePokjas = await Pokja.find({ 
      nama_pokja: { $exists: true, $ne: "" },
      status_pokja: { $in: ['draft', 'menunggu_persetujuan_admin', 'disetujui_admin'] }
    })
    .populate('ketua_id', 'nama_lengkap nim_nidn')
    .select('_id nama_pokja ketua_id anggota')
    .sort({ createdAt: -1 });

    // Format response to include member count
    const formattedPokjas = availablePokjas.map(p => ({
      _id: p._id,
      nama_pokja: p.nama_pokja,
      ketua_nama: p.ketua_id ? p.ketua_id.nama_lengkap : 'Unknown',
      jumlah_anggota: p.anggota ? p.anggota.length : 0
    }));

    return NextResponse.json({ data: formattedPokjas }, { status: 200 });
  } catch (error) {
    console.error('Error fetching available Pokja:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
