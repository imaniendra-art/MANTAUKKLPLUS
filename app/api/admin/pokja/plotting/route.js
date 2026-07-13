import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import User from '@/models/User';

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    const { nama_pokja, ketua_id, anggota_ids, mitra_id, dpl_id, periode } = data;

    if (!nama_pokja || !ketua_id) {
      return NextResponse.json({ error: "Nama POKJA dan Ketua wajib diisi" }, { status: 400 });
    }

    // 1. Cek apakah ketua sudah punya kelompok
    const existingPokjaKetua = await Pokja.findOne({
      $or: [
        { ketua_id },
        { "anggota.user_id": ketua_id, "anggota.status_undangan": "bergabung" }
      ]
    });

    if (existingPokjaKetua) {
      return NextResponse.json({ error: "Ketua yang dipilih sudah berada di kelompok lain." }, { status: 400 });
    }

    // 2. Cek apakah anggota sudah punya kelompok
    if (anggota_ids && anggota_ids.length > 0) {
      for (const id of anggota_ids) {
        const existingPokjaAnggota = await Pokja.findOne({
          $or: [
            { ketua_id: id },
            { "anggota.user_id": id, "anggota.status_undangan": "bergabung" }
          ]
        });
        if (existingPokjaAnggota) {
          const user = await User.findById(id).select('nama_lengkap');
          return NextResponse.json({ 
            error: `Mahasiswa bernama ${user?.nama_lengkap || id} sudah berada di kelompok lain.` 
          }, { status: 400 });
        }
      }
    }

    // 3. Susun data anggota dengan status langsung 'bergabung'
    const anggota = (anggota_ids || []).map(id => ({
      user_id: id,
      status_undangan: 'bergabung', // otomatis gabung
      nilai_rekomendasi_sistem: 0,
      nilai_akhir_mutlak: 0,
      catatan_evaluasi: ''
    }));

    // 4. Buat POKJA baru
    const newPokja = await Pokja.create({
      periode: periode || "Ganjil 2026/2027",
      nama_pokja,
      ketua_id,
      anggota,
      mitra_id: mitra_id || undefined,
      dpl_id: dpl_id || undefined,
      status_pokja: 'disetujui_admin', // Langsung masuk tahap persiapan
      is_locked_by_admin: true // Terkunci
    });

    return NextResponse.json({ message: "POKJA berhasil di-plot", pokja: newPokja }, { status: 201 });

  } catch (error) {
    console.error("Plotting Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
