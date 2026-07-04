import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import PaketMatkul from '@/models/PaketMatkul';
import LogAktivitas from '@/models/LogAktivitas';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  await dbConnect();
  try {
    const formData = await req.formData();
    
    const mahasiswa_id = formData.get('mahasiswa_id');
    const mitra_id = formData.get('mitra_id');
    const posisi_id = formData.get('posisi_id');
    const nomor_hp = formData.get('nomor_hp');
    const mitra_nama = formData.get('mitra_nama');
    const mitra_alamat = formData.get('mitra_alamat');
    const posisi_nama = formData.get('posisi_nama');
    
    const file_cv = formData.get('file_cv');
    let file_cv_path = '';

    if (file_cv && typeof file_cv === 'object') {
      const bytes = await file_cv.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Pastikan direktori public/uploads/cv/ ada secara fisik
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'cv');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Gunakan nama unik berbasis timestamp dan nama file
      const fileName = `${Date.now()}-${file_cv.name}`;
      const filePath = path.join(uploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      
      // Simpan path absolut publik
      file_cv_path = `/uploads/cv/${fileName}`;
    }

    // Fallback required fields for existing schema
    let paket_matkul_id = formData.get('paket_matkul_id');
    if (!paket_matkul_id) {
      const paket = await PaketMatkul.findOne();
      if (paket) paket_matkul_id = paket._id;
    }
    
    const User = (await import('@/models/User')).default;
    
    // Update nomor_hp if provided
    if (nomor_hp) {
      await User.findByIdAndUpdate(mahasiswa_id, { nomor_hp });
    }

    const Pokja = (await import('@/models/Pokja')).default;
    
    // Create new Pokja group
    const pengajuan = await Pokja.create({
      nama_pokja: `Pokja Baru`, // User can edit this later
      ketua_id: mahasiswa_id,
      anggota: [{ user_id: mahasiswa_id, status_undangan: 'bergabung' }],
      mitra_id: mitra_id || undefined,
      status_pokja: 'menunggu_persetujuan_lppm',
      tanggal_mulai: new Date(),
      tanggal_selesai: new Date(new Date().setMonth(new Date().getMonth() + 4)),
    });
    
    // Insert ke Log Aktivitas
    const mhs = await User.findById(mahasiswa_id);
    if (mhs) {
      await LogAktivitas.create({
        mahasiswa_id: mhs._id,
        nama_mahasiswa: mhs.nama_lengkap || mhs.name,
        aktivitas: `${mhs.nama_lengkap || mhs.name} telah mengajukan KKL Plus di posisi ${posisi_nama || 'Posisi KKL Plus'}`,
        status: 'menunggu'
      });
    }

    return NextResponse.json(pengajuan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
