import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Pemetaan ekstensi ke MIME type standar
const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
};

export async function GET(req, { params }) {
  try {
    // Kompatibilitas Next.js 15/16 async params
    const resolvedParams = await (params && typeof params.then === 'function' ? params : Promise.resolve(params));
    const pathSegments = resolvedParams?.path || [];

    if (!Array.isArray(pathSegments) || pathSegments.length === 0) {
      return NextResponse.json({ error: 'Path file tidak valid' }, { status: 400 });
    }

    // Sanitasi tiap segmen path untuk mencegah Directory Traversal attack
    const safeSegments = pathSegments.map(seg => seg.replace(/(\.\.[\/\\]|\.\.)/g, '').replace(/[^a-zA-Z0-9._-]/g, '_'));
    const relativeFilePath = path.join(...safeSegments);

    const uploadsBaseDir = path.join(process.cwd(), 'public', 'uploads');
    const fullFilePath = path.join(uploadsBaseDir, relativeFilePath);

    // Keamanan: Pastikan path berada dalam folder uploads
    if (!fullFilePath.startsWith(uploadsBaseDir)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    // Cek apakah file fisik ada di disk lokal
    if (!fs.existsSync(fullFilePath)) {
      // Fallback cerdas saat development / localhost:
      // Ambil file dari server produksi jika file fisik belum ada di harddisk lokal
      const host = req.headers.get('host') || '';
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || process.env.NODE_ENV !== 'production';

      if (isLocal) {
        const remoteBase = process.env.REMOTE_UPLOADS_ORIGIN || 'https://kklplus.stimiapps.my.id';
        const remoteUrl = `${remoteBase}/uploads/${safeSegments.join('/')}`;
        try {
          const remoteRes = await fetch(remoteUrl);
          if (remoteRes.ok) {
            const arrayBuffer = await remoteRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Simpan cache ke harddisk lokal agar request berikutnya langsung cepat tanpa fetch ulang
            try {
              await fs.promises.mkdir(path.dirname(fullFilePath), { recursive: true });
              await fs.promises.writeFile(fullFilePath, buffer);
            } catch (writeErr) {
              console.warn('Gagal menyimpan file cache lokal:', writeErr.message);
            }

            const ext = path.extname(fullFilePath).toLowerCase();
            const contentType = remoteRes.headers.get('content-type') || MIME_TYPES[ext] || 'application/octet-stream';
            const baseFileName = path.basename(fullFilePath);

            return new NextResponse(buffer, {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length.toString(),
                'Content-Disposition': `inline; filename="${baseFileName}"`,
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
              },
            });
          }
        } catch (fetchErr) {
          console.warn('Remote upload fallback fetch error:', fetchErr.message);
        }
      }

      return NextResponse.json({ error: 'File tidak ditemukan di server' }, { status: 404 });
    }

    const fileStat = await fs.promises.stat(fullFilePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Path bukan file' }, { status: 400 });
    }

    const fileBuffer = await fs.promises.readFile(fullFilePath);
    const ext = path.extname(fullFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const baseFileName = path.basename(fullFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Content-Disposition': `inline; filename="${baseFileName}"`,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Gagal membaca file dari server' }, { status: 500 });
  }
}
