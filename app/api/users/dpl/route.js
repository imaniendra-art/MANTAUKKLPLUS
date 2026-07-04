import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  try {
    const dpls = await User.find({ role: 'dpl' }).select('nama_lengkap _id');
    return NextResponse.json(dpls);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
