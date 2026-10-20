import fs from "fs";
import path from "path";

/**
 * Menerima URL file. Karena sistem sudah 100% menggunakan penyimpanan lokal,
 * kembalikan URL file secara langsung (/uploads/...).
 */
export async function generatePresignedUrl(fileUrl) {
    if (!fileUrl) return "";
    // Jika masih ada sisa URL Minio lama, abaikan agar tidak menimbulkan 403 di frontend
    if (typeof fileUrl === 'string' && (fileUrl.includes('minio') || fileUrl.includes('siam-stimi-test'))) {
        return "";
    }
    return fileUrl;
}

/**
 * Menyimpan buffer file langsung ke penyimpanan lokal server (/public/uploads/...).
 * @param {Buffer} buffer File buffer
 * @param {string} key Nama file atau path
 * @param {string} contentType MIME type
 * @param {string} customFolder Subfolder di dalam /public/uploads/
 * @returns {Promise<string>} URL publik lokal file (/uploads/folder/filename)
 */
export async function uploadToMinio(buffer, key, contentType, customFolder) {
    let folder = customFolder;
    if (!folder) {
        folder = key && key.includes('/') ? path.dirname(key) : 'surat';
    }
    folder = (folder || 'surat').replace(/[^a-zA-Z0-9_-]/g, '');
    const cleanBaseName = path.basename(key);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, cleanBaseName);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${folder}/${cleanBaseName}`;
}

/**
 * Menghapus file dari penyimpanan lokal server.
 * @param {string} fileUrl URL file (/uploads/...)
 */
export async function deleteFromMinio(fileUrl) {
    if (!fileUrl || typeof fileUrl !== 'string') return;

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
    }
}
