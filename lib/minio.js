import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
 */
export async function generatePresignedUrl(fileUrl) {
    if (!fileUrl || !process.env.MINIO_ENDPOINT) return fileUrl;

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
 * Mengunggah file buffer ke Minio.
 * Mengembalikan URL lengkap file di Minio (Raw URL).
 */
export async function uploadToMinio(buffer, key, contentType) {
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
}

/**
 * Menghapus file dari Minio menggunakan URL lengkap file.
 */
export async function deleteFromMinio(fileUrl) {
    if (!fileUrl || !process.env.MINIO_ENDPOINT) return;

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
