import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MONGODB_URI is fetched inside connectToDatabase to avoid build-time errors


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Fungsi auto-seed untuk membuat akun jika database kosong
async function seedInitialUsers() {
  try {
    const { default: User } = await import('@/models/User');
    
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('>>> MENGHIDUPKAN SISTEM: Tabel User kosong. Menjalankan auto-seed...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const seedUsers = [
        {
          role: 'admin',
          email: 'admin@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Admin Pusat STIMI',
          nim_nidn: 'ADMIN-STIMI-001'
        },
        {
          role: 'mahasiswa',
          email: 'mahasiswa@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Mahasiswa Tester',
          nim_nidn: '19201011'
        },
        {
          role: 'dpl',
          email: 'dpl@stimi.ac.id',
          password: hashedPassword,
          nama_lengkap: 'Bapak DPL',
          nim_nidn: 'DPL-09123456'
        }
      ];

      await User.insertMany(seedUsers);
      console.log('>>> AUTO-SEED BERHASIL: 3 akun dasar (Admin, Mahasiswa, DPL) siap digunakan.');
    }
  } catch (err) {
    console.error('Error saat melakukan auto-seed User:', err);
  }
}

async function seedPaketMatkul() {
  try {
    const { default: PaketMatkul } = await import('@/models/PaketMatkul');
    
    const targetNamaPaket = 'Kurikulum Konversi OBE Default - SKS Terintegrasi';
    const seedPaketData = {
      nama_paket: targetNamaPaket,
      jenis_skema: 'instansi',
      daftar_matkul: [
        {
          kode: 'MKK-01',
          nama: 'Manajemen Kinerja dan Kompensasi',
          sks: 3,
          cpmk_indikator: [
            'CPMK 1: Pemahaman Absensi & Kedisiplinan - Merekap kehadiran harian/mingguan',
            'CPMK 1: Pemahaman Absensi & Kedisiplinan - Mencatat data keterlambatan/izin kerja',
            'CPMK 2: Evaluasi Pencapaian Target - Mengumpulkan data pencapaian target sales/produksi',
            'CPMK 2: Evaluasi Pencapaian Target - Membantu penyusunan laporan evaluasi kinerja',
            'CPMK 3: Administrasi Kompensasi - Menghitung rekapitulasi jam lembur',
            'CPMK 3: Administrasi Kompensasi - Mendata pengajuan cuti atau klaim operasional',
            'CPMK 4: Pelatihan & Pengembangan - Membantu persiapan ruang/dokumen training',
            'CPMK 4: Pelatihan & Pengembangan - Mengumpulkan feedback pasca-pelatihan',
            'CPMK 5: Kesejahteraan & Hubungan Industrial - Mendata keluhan/kebutuhan fasilitas kerja',
            'CPMK 5: Kesejahteraan & Hubungan Industrial - Menyusun arsip administrasi BPJS/asuransi'
          ]
        },
        {
          kode: 'MKS-02',
          nama: 'Manajemen Strategi',
          sks: 3,
          cpmk_indikator: [
            'CPMK 1: Pemetaan Masalah Operasional - Melakukan observasi alur kerja departemen',
            'CPMK 1: Pemetaan Masalah Operasional - Mengidentifikasi botlenecks/hambatan operasional',
            'CPMK 2: Perencanaan Strategis (Rapat) - Menyusun agenda/notulensi rapat koordinasi divisi',
            'CPMK 2: Perencanaan Strategis (Rapat) - Membantu pembuatan dashboard data target berkala',
            'CPMK 3: Analisis Kompetitor & Pasar - Mengumpulkan data keunggulan produk saingan',
            'CPMK 3: Analisis Kompetitor & Pasar - Menyusun SWOT matriks sederhana berdasarkan arahan',
            'CPMK 4: Eksekusi Taktik/Program Kerja - Melakukan follow-up tugas ke PIC departemen lain',
            'CPMK 4: Eksekusi Taktik/Program Kerja - Memantau deadline timeline program kerja divisi',
            'CPMK 5: Evaluasi Dampak Strategis - Membantu mengumpulkan data ROI/efektivitas program',
            'CPMK 5: Evaluasi Dampak Strategis - Menyusun slide presentasi review pencapaian divisi'
          ]
        },
        {
          kode: 'MKR-03',
          nama: 'Manajemen Resiko',
          sks: 3,
          cpmk_indikator: [
            'CPMK 1: Identifikasi Potensi Risiko - Mencatat potensi bahaya fisik di area kerja/gudang',
            'CPMK 1: Identifikasi Potensi Risiko - Mendata kelemahan sistem pencatatan manual',
            'CPMK 2: Analisis Dampak Insiden - Mengklasifikasikan insiden operasional ringan/sedang',
            'CPMK 2: Analisis Dampak Insiden - Membantu menaksir potensi kerugian material/waktu',
            'CPMK 3: Penerapan Langkah Mitigasi - Membantu penyusunan SOP tanggap darurat baru',
            'CPMK 3: Penerapan Langkah Mitigasi - Menyiapkan alat pelindung diri atau checklist safety audit',
            'CPMK 4: Pemantauan Berkelanjutan - Melakukan patroli pengecekan keamanan/kebersihan',
            'CPMK 4: Pemantauan Berkelanjutan - Pengecekan expired date barang',
            'CPMK 5: Pelaporan Insiden - Membuat kronologi/berita acara saat terjadi masalah',
            'CPMK 5: Pelaporan Insiden - Mendokumentasikan kerusakan/kehilangan barang'
          ]
        }
      ]
    };

    const existing = await PaketMatkul.findOne({ nama_paket: targetNamaPaket });
    if (existing) {
      console.log(`>>> MENGUPDATE SISTEM: PaketMatkul "${targetNamaPaket}" ditemukan. Mengupdate data dengan 5 CPMK & Indikator baru...`);
      existing.daftar_matkul = seedPaketData.daftar_matkul;
      existing.jenis_skema = seedPaketData.jenis_skema;
      await existing.save();
      console.log('>>> AUTO-SEED UPDATE BERHASIL: 3 Mata Kuliah dengan 5 CPMK & Indikator lengkap berhasil diupdate.');
    } else {
      console.log('>>> MENGHIDUPKAN SISTEM: PaketMatkul kosong. Menjalankan auto-seed...');
      await PaketMatkul.create(seedPaketData);
      console.log('>>> AUTO-SEED BERHASIL: 3 Mata Kuliah dengan 5 CPMK & Indikator lengkap berhasil ditambahkan.');
    }
  } catch (err) {
    console.error('Error saat melakukan auto-seed PaketMatkul:', err);
  }
}

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // Jalankan seeding segera setelah MongoDB terkoneksi
      await seedInitialUsers();
      await seedPaketMatkul();
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
