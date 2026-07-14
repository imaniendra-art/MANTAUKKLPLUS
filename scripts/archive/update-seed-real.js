const fs = require('fs');

const routeCode = `import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PaketMatkul from '@/models/PaketMatkul';

export async function GET() {
  await dbConnect();
  try {
    const paket = await PaketMatkul.find({});
    if (paket.length === 0) {
      // Seed initial dummy data if empty so UI looks good out of the box
      const dummy = await PaketMatkul.create({
        nama_paket: "Kurikulum Konversi OBE Default - SKS Terintegrasi",
        jenis_skema: "instansi",
        mata_kuliah: [
          {
            "kode": "STY. 501",
            "nama": "Entrepreneurship: Prototyping & Project",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Identifikasi Peluang Inovasi Layanan Bisnis",
                "indikator": [
                  "Mengobservasi dan mencatat kelemahan alur kerja harian di divisi penempatan",
                  "Memetakan kebutuhan pelanggan atau mitra instansi yang belum terpenuhi"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Perancangan Purwarupa Solusi Operasional",
                "indikator": [
                  "Menyusun draf ide atau konsep perbaikan layanan",
                  "Membuat sketsa, alur diagram, atau purwarupa (prototype) sistem baru"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Eksekusi dan Pengujian Proyek Kolaboratif",
                "indikator": [
                  "Menjalankan uji coba proyek inovasi skala kecil bersama tim",
                  "Mengumpulkan umpan balik (feedback) dari pengguna atau rekan kerja terkait purwarupa"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Penyusunan Laporan Evaluasi Proyek",
                "indikator": [
                  "Menganalisis efisiensi waktu atau biaya dari proyek yang diuji coba",
                  "Mempresentasikan laporan akhir hasil proyek kepada mentor lapangan"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 501",
            "nama": "Teori Pengambilan Keputusan",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Kemampuan Berbicara di Depan Forum dan Mengarahkan Pertemuan",
                "indikator": [
                  "Memimpin rapat koordinasi singkat (briefing) harian divisi",
                  "Menjadi moderator dalam diskusi pemecahan masalah tim",
                  "Menyusun dan mengarahkan agenda pertemuan kelompok kerja"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Analisis Masalah Operasional Berbasis Data Faktual",
                "indikator": [
                  "Mengumpulkan data keluhan pelanggan atau laporan kendala lapangan",
                  "Melakukan wawancara dengan staf terkait akar penyebab masalah teknis",
                  "Menyusun tabulasi atau klasifikasi tingkat urgensi masalah"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Perumusan dan Rekomendasi Solusi Taktis",
                "indikator": [
                  "Mengajukan minimal 2 alternatif solusi pemecahan masalah kepada mentor",
                  "Menyusun analisis perbandingan keuntungan dan risiko dari pilihan solusi"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Eksekusi dan Evaluasi Dampak Keputusan",
                "indikator": [
                  "Menjalankan langkah penanganan masalah sesuai arahan/keputusan yang disetujui",
                  "Memantau dan mencatat dampak pasca-eksekusi terhadap kelancaran tim"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 502",
            "nama": "Manajemen Kinerja dan Kompensasi",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Evaluasi Tingkat Kedisiplinan dan Kehadiran SDM",
                "indikator": [
                  "Merekapitulasi data absensi harian atau mingguan staf/karyawan",
                  "Mencatat dan mengelompokkan data keterlambatan, sakit, atau izin"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Pengukuran Pencapaian Target Kerja (KPI)",
                "indikator": [
                  "Membantu mengumpulkan data capaian target operasional atau sales harian",
                  "Membuat draf grafik atau tabel progres pencapaian kinerja divisi",
                  "Membantu mentor lapangan dalam menyusun draf penilaian kinerja berkala"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Pengelolaan Administrasi Kompensasi dan Hak Karyawan",
                "indikator": [
                  "Menghitung rekapitulasi akumulasi jam lembur tim/divisi",
                  "Membantu verifikasi dokumen pengajuan cuti atau klaim biaya operasional"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Pelatihan dan Pengembangan Kapasitas Kerja",
                "indikator": [
                  "Membantu menyiapkan akomodasi, ruang, atau dokumen administrasi pelatihan karyawan",
                  "Menyebarkan dan merekap kuesioner evaluasi pasca-pelatihan SDM"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 503",
            "nama": "Manajemen Strategi",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Pemetaan Situasi Operasional Menggunakan Metode SWOT",
                "indikator": [
                  "Mengidentifikasi kekuatan internal dan kelemahan sistem kerja divisi",
                  "Memetakan peluang pasar atau ancaman eksternal yang dihadapi instansi"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Perumusan Rencana Aksi dan Taktik Kerja",
                "indikator": [
                  "Mengikuti rapat strategis bulanan dan merangkum notulen rapat secara terstruktur",
                  "Memberikan usulan tertulis untuk taktik peningkatan efisiensi kerja tim"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Implementasi Program Kerja Strategis",
                "indikator": [
                  "Terlibat langsung dalam eksekusi campaign, promo, atau program layanan baru",
                  "Membantu sosialisasi panduan atau SOP baru kepada staf atau pengguna layanan"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Pengawasan dan Pengauditan Kesesuaian Rencana",
                "indikator": [
                  "Melakukan audit kecocokan stok fisik barang dengan data di sistem aplikasi",
                  "Memeriksa kelengkapan berkas administrasi berkala agar sesuai standar kepatuhan"
                ]
              },
              {
                "nama_cpmk": "CPMK 5: Rekomendasi Peningkatan Berkelanjutan (Continuous Improvement)",
                "indikator": [
                  "Membuat laporan evaluasi keberhasilan program kerja mingguan",
                  "Menyusun draf rekomendasi perbaikan untuk siklus program berikutnya"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 404",
            "nama": "Manajemen Ritel",
            "sks": 2,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Penerapan Standar Pelayanan Prima (Service Excellence)",
                "indikator": [
                  "Melayani konsultasi, keluhan, atau transaksi pelanggan secara langsung di garda depan",
                  "Memastikan kecepatan dan keramahan penanganan kebutuhan konsumen instansi"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Manajemen Ketersediaan Stok dan Logistik Operasional",
                "indikator": [
                  "Melakukan pengecekan berkala terhadap jumlah stok barang fisik atau form layanan",
                  "Membuat daftar pengajuan restock atau pemesanan ulang barang operasional yang habis"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Pengaturan Tata Letak (Display) dan Visual Merchandising",
                "indikator": [
                  "Merapikan susunan dokumen, arsip, atau produk di area layanan agar mudah diakses",
                  "Menata papan informasi atau media promosi agar terlihat jelas oleh pengunjung"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Analisis Perilaku dan Keluhan Pelanggan Ritel",
                "indikator": [
                  "Merekap dan mengelompokkan jenis komplain atau masukan dari konsumen harian",
                  "Menyusun ringkasan produk atau layanan yang paling diminati sepanjang minggu"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 405",
            "nama": "Manajemen Risiko",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Identifikasi Potensi Bahaya dan Risiko Operasional",
                "indikator": [
                  "Melakukan inspeksi berkala terhadap kelayakan fasilitas kerja atau keamanan gudang",
                  "Mendata aset penting, perangkat elektronik, atau data digital yang rawan rusak/hilang"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Analisis Dampak dan Taksiran Kerugian Insiden",
                "indikator": [
                  "Menghitung perkiraan kerugian waktu atau biaya akibat terjadinya kesalahan sistem/data",
                  "Memetakan risiko berdasarkan frekuensi terjadinya kendala kerja"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Penerapan Prosedur Mitigasi dan K3",
                "indikator": [
                  "Menjalankan tindakan pencegahan seperti backup data berkala atau merapikan kabel darurat",
                  "Membantu pemasangan atau pemeriksaan alat keselamatan kerja di area operasional"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Penyusunan Dokumen Pelaporan dan Berita Acara Insiden",
                "indikator": [
                  "Menulis kronologi lengkap (Berita Acara Kejadian) ketika terjadi masalah operasional di kantor",
                  "Mendokumentasikan bukti fisik atau digital dari aset yang mengalami kerusakan"
                ]
              }
            ]
          },
          {
            "kode": "MNJ. 602",
            "nama": "Manajemen Kepemimpinan Bisnis dan Organisasi",
            "sks": 3,
            "cpmk": [
              {
                "nama_cpmk": "CPMK 1: Demonstrasi Inisiatif dan Tanggung Jawab Penugasan",
                "indikator": [
                  "Mengambil inisiatif menyelesaikan tugas mandiri tanpa perlu diawasi ketat",
                  "Bertanggung jawab mengoordinasikan penyelesaian target kecil di dalam kelompok"
                ]
              },
              {
                "nama_cpmk": "CPMK 2: Komunikasi Efektif dan Koordinasi Lintas Fungsi",
                "indikator": [
                  "Menyampaikan instruksi atau laporan progres kerja dengan sopan dan jelas kepada atasan",
                  "Melakukan koordinasi antar-divisi untuk kelancaran pertukaran data operasional"
                ]
              },
              {
                "nama_cpmk": "CPMK 3: Manajemen Dinamika dan Jembatan Konflik Tim",
                "indikator": [
                  "Membantu menengahi perbedaan pendapat antar rekan kerja dalam diskusi proyek",
                  "Menjaga motivasi dan suasana kerja tim tetap kondusif selama masa tenggat (deadline)"
                ]
              },
              {
                "nama_cpmk": "CPMK 4: Pengorganisasian Delegasi Tugas Divisi",
                "indikator": [
                  "Membantu mentor lapangan membagi porsi kerja harian kepada anggota tim magang lainnya",
                  "Menyusun jadwal piket atau matriks tanggung jawab mingguan kelompok kerja"
                ]
              },
              {
                "nama_cpmk": "CPMK 5: Penerapan Budaya Disiplin dan Etika Profesional Instansi",
                "indikator": [
                  "Menjadi contoh dalam ketepatan waktu hadir dan pemakaian atribut kerja resmi",
                  "Menerapkan prinsip kerahasiaan data dan kode etik profesi di lingkungan instansi magang"
                ]
              }
            ]
          }
        ]
      });
      return NextResponse.json([dummy]);
    }
    return NextResponse.json(paket);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const data = await req.json();
    
    if (data.action === 'add_indikator') {
      const { paketId, matkulId, cpmkId, indikator } = data;
      const paket = await PaketMatkul.findById(paketId);
      if (!paket) throw new Error("Paket tidak ditemukan");
      
      const matkul = paket.mata_kuliah.id(matkulId);
      if (!matkul) throw new Error("Mata kuliah tidak ditemukan");
      
      const cpmk = matkul.cpmk.id(cpmkId);
      if (!cpmk) throw new Error("CPMK tidak ditemukan");
      
      cpmk.indikator.push(indikator);
      await paket.save();
      
      return NextResponse.json(paket);
    }

    if (data.action === 'add_cpmk') {
      const { paketId, matkulId, nama_cpmk } = data;
      const paket = await PaketMatkul.findById(paketId);
      if (!paket) throw new Error("Paket tidak ditemukan");
      
      const matkul = paket.mata_kuliah.id(matkulId);
      if (!matkul) throw new Error("Mata kuliah tidak ditemukan");
      
      matkul.cpmk.push({ nama_cpmk, indikator: [] });
      await paket.save();
      
      return NextResponse.json(paket);
    }
    
    const newPaket = await PaketMatkul.create(data);
    return NextResponse.json(newPaket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

fs.writeFileSync('app/api/paket-matkul/route.js', routeCode);
console.log("Auto-seed script updated with real JSON data successfully.");
