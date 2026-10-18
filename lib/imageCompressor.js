/**
 * Utilitas Kompresi Gambar Client-Side untuk Mantau KKL Plus
 * Mengoptimalkan foto beresolusi tinggi (kamera HP 5MB - 20MB)
 * menjadi ukuran ringan (~100KB - 250KB) sebelum diunggah ke server.
 * 
 * Keunggulan:
 * - Menghemat kuota internet mahasiswa saat upload di lokasi KKL
 * - Menghilangkan pesan error "Ukuran file maksimal 2MB"
 * - Menghemat penyimpanan server kampus hingga 90%
 * - Mempercepat loading galeri foto dan dokumen monev
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Mengompres file gambar dari input file HTML
 * @param {File|Blob} file File gambar asli dari input
 * @param {Object} options Pengaturan kompresi
 * @param {number} [options.maxWidth=1280] Lebar maksimum (px)
 * @param {number} [options.maxHeight=1280] Tinggi maksimum (px)
 * @param {number} [options.quality=0.75] Kualitas kompresi (0.1 - 1.0)
 * @param {string} [options.outputType='image/jpeg'] Tipe output MIME
 * @returns {Promise<{dataUrl: string, originalSize: number, compressedSize: number, compressionRatio: number, width: number, height: number, isImage: boolean}>}
 */
export async function compressImage(file, options = {}) {
  if (!file) {
    throw new Error('Tidak ada file yang dipilih');
  }

  // Jika bukan tipe gambar (misal file PDF), lewati kompresi canvas
  if (!file.type || !file.type.startsWith('image/')) {
    return {
      dataUrl: null,
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
      isImage: false,
    };
  }

  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    outputType = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('compressImage hanya dapat dijalankan di browser (client-side).'));
    }

    const reader = new FileReader();

    reader.onerror = (err) => reject(new Error('Gagal membaca file gambar: ' + (err.message || 'Unknown error')));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Format gambar tidak didukung atau file korup.'));

      img.onload = () => {
        try {
          let { width, height } = img;

          // Skala proporsional jika ukuran melebihi batas maxWidth / maxHeight
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback jika konteks canvas gagal dibuat
            return resolve({
              dataUrl: event.target.result,
              originalSize: file.size,
              compressedSize: file.size,
              compressionRatio: 0,
              width: img.width,
              height: img.height,
              isImage: true,
            });
          }

          // Latar belakang putih untuk menghindari artefak hitam pada transparansi
          if (outputType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL(outputType, quality);

          // Estimasi byte size dari base64
          const base64Content = dataUrl.split(',')[1] || '';
          const compressedSize = Math.round((base64Content.length * 3) / 4);

          // Persentase hemat ukuran
          const savedBytes = Math.max(0, file.size - compressedSize);
          const compressionRatio = file.size > 0 
            ? Math.round((savedBytes / file.size) * 100) 
            : 0;

          resolve({
            dataUrl,
            originalSize: file.size,
            compressedSize,
            compressionRatio,
            width,
            height,
            isImage: true,
          });
        } catch (err) {
          reject(err);
        }
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}
