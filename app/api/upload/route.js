import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. Dukung FormData jika ada pengiriman form biasa
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const prefix = formData.get('prefix') || 'logbook';

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const safePrefix = (prefix || 'logbook').replace(/[^a-zA-Z0-9_-]/g, '');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', safePrefix);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${cleanName}${ext}`;
      const filePath = path.join(uploadDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/${safePrefix}/${filename}`;

      return NextResponse.json({ url: publicUrl, success: true });
    }

    // 2. Dukung JSON Base64 (Logbook, Monev, Laporan Akhir)
    const { imageBase64, prefix = 'logbook' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Ekstrak mime type dan base64 data
    const matches = imageBase64.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 string" }, { status: 400 });
    }

    const mimeType = matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], 'base64');
    
    let extension = 'jpg';
    if (mimeType.includes('png')) extension = 'png';
    else if (mimeType.includes('webp')) extension = 'webp';
    else if (mimeType.includes('pdf')) extension = 'pdf';
    else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
    else {
      const part = mimeType.split('/')[1];
      if (part) extension = part.split('+')[0];
    }

    const safePrefix = (prefix || 'logbook').replace(/[^a-zA-Z0-9_-]/g, '');
    const filename = `${safePrefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safePrefix);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safePrefix}/${filename}`;

    return NextResponse.json({ url: publicUrl, success: true });

  } catch (error) {
    console.error("Local Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

