import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const pokjaId = formData.get('pokjaId');
    const documentType = formData.get('documentType'); // 'loa', 'mou', 'foto_kantor_desa', dll

    if (!file || !pokjaId || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Tentukan direktori penyimpanan lokal (mitra untuk foto/logo profil, surat untuk dokumen PDF resmi)
    const isMitraMedia = ['foto_kantor_desa', 'foto_kantor_bumdes', 'logo_mitra'].includes(documentType);
    const subfolder = isMitraMedia ? 'mitra' : 'surat';

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${pokjaId}_${documentType}_${Date.now()}_${cleanFileName}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${subfolder}/${fileName}`;

    await dbConnect();

    const updatePayload = {};
    let updatedData = null;

    if (['mou', 'moa', 'ia', 'foto_kantor_desa', 'foto_kantor_bumdes', 'logo_mitra'].includes(documentType)) {
      const pokja = await Pokja.findById(pokjaId);
      if (pokja && pokja.mitra_id) {
        const MitraKKL = (await import('@/models/MitraKKL')).default;
        const mitraId = pokja.mitra_id._id || pokja.mitra_id;
        
        const mitraUpdate = {};
        if (documentType === 'mou') {
          mitraUpdate.file_mou = fileUrl;
          mitraUpdate.status_kerjasama = 'Memorandum of Understanding (MoU)';
        }
        if (documentType === 'moa') {
          mitraUpdate.file_moa = fileUrl;
          mitraUpdate.status_kerjasama = 'Memorandum of Agreement (MoA)';
        }
        if (documentType === 'ia') {
          mitraUpdate.file_ia = fileUrl;
          mitraUpdate.status_kerjasama = 'Implementation Arrangement (IA)';
        }
        if (documentType === 'foto_kantor_desa') mitraUpdate.foto_kantor_desa = fileUrl;
        if (documentType === 'foto_kantor_bumdes') mitraUpdate.foto_kantor_bumdes = fileUrl;
        if (documentType === 'logo_mitra') mitraUpdate.logo_mitra = fileUrl;
        
        updatedData = await MitraKKL.findByIdAndUpdate(mitraId, { $set: mitraUpdate }, { new: true });
      }
    } else {
      if (documentType === 'loa') {
        updatePayload.file_surat_balasan = fileUrl;
      } else if (documentType === 'sertifikat') {
        updatePayload.file_surat_selesai = fileUrl;
      } else if (documentType === 'sk') {
        updatePayload.file_surat_tugas = fileUrl;
      }

      updatedData = await Pokja.findByIdAndUpdate(
        pokjaId,
        { $set: updatePayload },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, fileUrl, url: fileUrl, data: updatedData });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
