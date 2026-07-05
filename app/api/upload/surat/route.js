import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import Pokja from '@/models/Pokja';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const pokjaId = formData.get('pokjaId');
    const documentType = formData.get('documentType'); // 'loa' atau 'sertifikat'

    if (!file || !pokjaId || !documentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${pokjaId}_${documentType}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'surat');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/surat/${fileName}`;

    await dbConnect();

    const updatePayload = {};
    if (documentType === 'loa') {
      updatePayload.file_surat_balasan = fileUrl;
      updatePayload.status_pokja = 'menunggu_persetujuan_lppm'; // Auto update status
    } else if (documentType === 'sertifikat') {
      updatePayload.file_surat_selesai = fileUrl;
    }

    const updatedPokja = await Pokja.findByIdAndUpdate(
      pokjaId,
      { $set: updatePayload },
      { new: true }
    );

    return NextResponse.json({ success: true, fileUrl, pokja: updatedPokja });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
