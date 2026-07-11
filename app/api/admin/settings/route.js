import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import SystemSettings from '@/models/SystemSettings';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // We only need one settings document
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    await connectToDatabase();
    
    let settings = await SystemSettings.findOne({});
    if (!settings) {
      settings = await SystemSettings.create(data);
    } else {
      settings.periode_aktif = data.periode_aktif;
      settings.pendaftaran_buka = data.pendaftaran_buka;
      settings.pengisian_logbook_buka = data.pengisian_logbook_buka;
      settings.pengumpulan_laporan_buka = data.pengumpulan_laporan_buka;
      if (data.daftar_periode) {
        settings.daftar_periode = data.daftar_periode;
      }
      await settings.save();
    }

    return NextResponse.json({ message: 'Pengaturan berhasil diperbarui', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
