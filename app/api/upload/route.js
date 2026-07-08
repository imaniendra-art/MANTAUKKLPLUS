import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { uploadToMinio } from '@/lib/minio';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Ekstrak mime type dan base64 data
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: "Invalid base64 string" }, { status: 400 });
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    const extension = mimeType.split('/')[1] || 'jpg';
    const filename = `logbook_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${extension}`;

    const publicUrl = await uploadToMinio(buffer, filename, mimeType);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error("S3 Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
