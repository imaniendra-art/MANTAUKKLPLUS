import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

export const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT ?? "",
    region: "us-east-1", // Minio mengabaikan ini, tapi tetap wajib diisi
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY ?? "",
        secretAccessKey: process.env.MINIO_SECRET_KEY ?? "",
    },
    forcePathStyle: true, // Wajib true untuk Minio
});

/**
 * Menerima URL file mentah, jika URL tersebut dari MinIO, 
 * akan mengembalikan Signed URL sementara yang bisa diakses publik.
 * Jika URL lokal (/uploads/...) atau MinIO non-aktif, kembalikan as-is.
 */
export async function generatePresignedUrl(fileUrl) {
    if (!fileUrl) return fileUrl;
    if (fileUrl.startsWith('/uploads/')) return fileUrl;
    if (!process.env.MINIO_ENDPOINT || process.env.STORAGE_DRIVER === 'local') return fileUrl;

    try {
        // Hapus trailing slash jika ada
        const endpoint = process.env.MINIO_ENDPOINT.replace(/\/$/, "");
        const prefix = `${endpoint}/${process.env.MINIO_BUCKET}/`;
        
        if (fileUrl.startsWith(prefix)) {
            let key = fileUrl.replace(prefix, "");
            if (key.includes('?')) {
                key = key.split('?')[0];
            }
            const command = new GetObjectCommand({
                Bucket: process.env.MINIO_BUCKET ?? "",
                Key: decodeURIComponent(key),
            });
            // URL aktif selama 1 jam (3600 detik)
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        }
    } catch (err) {
        console.error("Gagal generate signed URL:", err);
    }

    return fileUrl;
}

/**
 * Mengunggah file buffer ke local storage atau Minio.
 * Secara default disimpan ke local storage (/uploads/...).
 */
export async function uploadToMinio(buffer, key, contentType, customFolder) {
    const useLocal = process.env.STORAGE_DRIVER !== 's3' || !process.env.MINIO_ENDPOINT;

    if (useLocal) {
        let folder = customFolder;
        if (!folder) {
            folder = key.includes('/') ? path.dirname(key) : 'surat';
        }
        folder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
        const cleanBaseName = path.basename(key);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, cleanBaseName);
        await fs.promises.writeFile(filePath, buffer);
        return `/uploads/${folder}/${cleanBaseName}`;
    }

    try {
        const bucket = process.env.MINIO_BUCKET ?? "";
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });
        await s3Client.send(command);
        
        const endpoint = process.env.MINIO_ENDPOINT.replace(/\/$/, "");
        return `${endpoint}/${bucket}/${key}`;
    } catch (err) {
        console.warn("Upload ke Minio gagal, beralih ke penyimpanan lokal:", err.message);
        const folder = customFolder || 'surat';
        const cleanBaseName = path.basename(key);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, cleanBaseName);
        await fs.promises.writeFile(filePath, buffer);
        return `/uploads/${folder}/${cleanBaseName}`;
    }
}

/**
 * Menghapus file dari lokal atau Minio menggunakan URL lengkap file.
 */
export async function deleteFromMinio(fileUrl) {
    if (!fileUrl) return;

    if (fileUrl.startsWith('/uploads/')) {
        try {
            const relPath = fileUrl.replace(/^\//, '');
            const fullPath = path.join(process.cwd(), 'public', relPath);
            if (fs.existsSync(fullPath)) {
                await fs.promises.unlink(fullPath);
            }
        } catch (err) {
            console.error("Gagal menghapus file lokal:", err);
        }
        return;
    }

    if (!process.env.MINIO_ENDPOINT) return;

    try {
        const endpoint = process.env.MINIO_ENDPOINT.replace(/\/$/, "");
        const prefix = `${endpoint}/${process.env.MINIO_BUCKET}/`;
        
        if (fileUrl.startsWith(prefix)) {
            const key = fileUrl.replace(prefix, "");
            const command = new DeleteObjectCommand({
                Bucket: process.env.MINIO_BUCKET ?? "",
                Key: decodeURIComponent(key),
            });
            await s3Client.send(command);
        }
    } catch (err) {
        console.error("Gagal menghapus file dari Minio:", err);
    }
}

