import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Pokja from '@/models/Pokja';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'mahasiswa') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Check if user is ketua
    const pokjaAsKetua = await Pokja.findOne({ ketua_id: session.user.id });
    if (pokjaAsKetua) {
      return NextResponse.json({ plotted: true, peran: 'ketua', pokja: pokjaAsKetua });
    }

    // Check if user is anggota
    const pokjaAsAnggota = await Pokja.findOne({ 'anggota.user_id': session.user.id });
    if (pokjaAsAnggota) {
      return NextResponse.json({ plotted: true, peran: 'anggota', pokja: pokjaAsAnggota });
    }

    return NextResponse.json({ plotted: false });
  } catch (error) {
    console.error('Error cek-plot:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan' }, { status: 500 });
  }
}
