import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaketMatkul from '@/models/PaketMatkul';

export async function GET() {
  await dbConnect();
  const paket = await PaketMatkul.find({});
  const debug = paket.map(p => ({
    paket_id: p._id,
    matkuls: p.mata_kuliah.map(m => ({
      matkul_id_underscore: m._id,
      matkul_id_getter: m.id,
      nama: m.nama,
      cpmks: m.cpmk.map(c => ({
        cpmk_id_underscore: c._id,
        cpmk_id_getter: c.id,
        nama: c.nama_cpmk
      }))
    }))
  }));
  return NextResponse.json(debug);
}
