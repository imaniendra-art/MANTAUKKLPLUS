const { MongoClient } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

const payload = [
  {
    "nama_paket": "Kurikulum Konversi OBE Default - SKS Terintegrasi",
    "mata_kuliah": [
      {
        "kode": "STY. 501",
        "nama": "Entrepreneurship: Prototyping & Project",
        "sks": 3,
        "cpmk": [
          {
            "nama_cpmk": "CPMK 1: Mahasiswa mampu mengidentifikasi peluang inovasi dan kebutuhan pengembangan layanan bisnis baru di divisi tempat magang.",
            "indikator": [
              "Mengobservasi dan mencatat kelemahan alur kerja harian di divisi penempatan.",
              "Memetakan kebutuhan pelanggan atau mitra instansi yang belum terpenuhi secara optimal.",
              "Melakukan wawancara dengan Mentor mengenai tantangan terbesar divisi bulan ini.",
              "Menganalisis efisiensi penggunaan dokumen kertas vs digital di meja kerja.",
              "Menyusun daftar prioritas masalah operasional yang potensial untuk diselesaikan.",
              "Mempelajari sistem kerja kompetitor atau instansi sejenis sebagai tolok ukur inovasi."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu merancang purwarupa (prototype) atau draf solusi awal untuk memecahkan masalah operasional.",
            "indikator": [
              "Menyusun draf proposal ide atau konsep awal perbaikan layanan/fitur.",
              "Membuat sketsa kasar, alur diagram (flowchart), atau wireframe sistem baru.",
              "Merancang mock-up tampilan atau formulir digital baru untuk efisiensi data.",
              "Menyusun daftar kebutuhan alat, bahan, atau perangkat lunak pendukung solusi.",
              "Mendiskusikan draf purwarupa awal dengan rekan tim magang untuk masukan.",
              "Membuat simulasi sederhana atau aturan tertulis awal dari prosedur yang diusulkan."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu mengeksekusi dan menguji kelayakan dari proyek atau ide inovasi yang diusulkan secara kolaboratif.",
            "indikator": [
              "Menjalankan uji coba proyek inovasi skala kecil (pilot project) di unit kerja.",
              "Mengumpulkan umpan balik (feedback) langsung dari pengguna atau staf operasional.",
              "Mencatat kendala teknis atau error yang muncul selama masa uji coba purwarupa.",
              "Melakukan revisi cepat pada fungsi purwarupa berdasarkan masukan lapangan.",
              "Mengukur waktu penyelesaian tugas sebelum dan sesudah menggunakan sistem baru.",
              "Melatih rekan kerja atau sesama mahasiswa dalam mengoperasikan modul purwarupa."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu menyusun laporan evaluasi dari proyek wirausaha/inovasi yang memberikan nilai tambah efisiensi.",
            "indikator": [
              "Menganalisis penghematan waktu, tenaga, atau biaya dari proyek yang diuji.",
              "Menyusun dokumen laporan akhir hasil implementasi proyek secara sistematis.",
              "Membuat infografis atau grafik pencapaian sebelum vs sesudah proyek inovasi.",
              "Mempresentasikan laporan hasil dan dampak inovasi di depan Mentor lapangan.",
              "Menyusun draf serah terima dokumen hasil proyek agar bisa dilanjutkan instansi."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu berbicara di depan forum, menyampaikan pendapat logis, dan mengarahkan jalannya pertemuan.",
            "indikator": [
              "Memimpin rapat koordinasi singkat (briefing) harian atau mingguan divisi.",
              "Menjadi moderator dalam diskusi pemecahan masalah (problem solving) tim.",
              "Menyusun dan mengarahkan agenda pertemuan kelompok kerja magang.",
              "Menyampaikan gagasan atau pendapat secara lisan dalam rapat evaluasi bulanan.",
              "Merangkum kesimpulan hasil diskusi dan membacakannya di akhir pertemuan.",
              "Menjawab pertanyaan atau menyanggah argumen dengan sopan dalam forum resmi.",
              "Menjembatani perbedaan pendapat antara anggota rapat agar mencapai mufakat."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu menganalisis masalah operasional berdasarkan data faktual dan bukti lapangan.",
            "indikator": [
              "Mengumpulkan data keluhan pelanggan atau laporan kendala dari lapangan.",
              "Melakukan wawancara mendalam dengan staf terkait akar penyebab masalah.",
              "Menyusun tabulasi, grafik, atau klasifikasi tingkat urgensi masalah kerja.",
              "Memeriksa kevalidan data atau dokumen yang memicu terjadinya kesalahan operasional.",
              "Mengidentifikasi dampak kerugian waktu atau materi dari suatu masalah.",
              "Menganalisis tren kemunculan masalah yang sering berulang setiap minggunya."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu merumuskan, merekomendasikan, dan memilih alternatif solusi taktis yang rasional.",
            "indikator": [
              "Mengajukan minimal 2 alternatif solusi pemecahan masalah kepada mentor.",
              "Menyusun analisis perbandingan keuntungan, biaya, dan risiko dari tiap pilihan.",
              "Menentukan kriteria penilaian bobot solusi sebelum mengambil keputusan akhir.",
              "Membuat rekomendasi keputusan tertulis dilengkapi dengan data pendukung.",
              "Meminta persetujuan atau tanda tangan otoritas di atasnya untuk solusi terpilih."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu mengeksekusi keputusan dan mengevaluasi dampak pasca-eksekusi.",
            "indikator": [
              "Menjalankan langkah penanganan masalah sesuai keputusan yang disetujui.",
              "Memantau dan mencatat dampak langsung keputusan terhadap kelancaran tim.",
              "Mengidentifikasi efek samping atau resistensi staf terhadap keputusan baru.",
              "Melakukan penyesuaian (adjustments) darurat jika keputusan awal menemui kendala.",
              "Menulis laporan evaluasi akhir mengenai efektivitas keputusan yang diambil."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu mengevaluasi tingkat kedisiplinan, kehadiran, dan tata tertib SDM di tempat kerja.",
            "indikator": [
              "Merekapitulasi data absensi harian atau mingguan staf/karyawan.",
              "Mencatat, memilah, dan mengelompokkan data keterlambatan, sakit, atau izin.",
              "Memeriksa kepatuhan karyawan terhadap penggunaan atribut kerja resmi.",
              "Membantu menginput data kartu jam kerja ke dalam sistem internal kantor.",
              "Mengidentifikasi pola ketidakhadiran karyawan pada hari-hari tertentu.",
              "Menyusun draf teguran atau pengingat lisan terkait kedisiplinan waktu kerja."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu mengukur dan memetakan pencapaian target kerja (Key Performance Indicators) karyawan.",
            "indikator": [
              "Membantu mengumpulkan data capaian target operasional atau sales harian.",
              "Membuat draf grafik atau tabel progres pencapaian kinerja individu/divisi.",
              "Membantu mentor lapangan menyusun form draf penilaian kinerja berkala.",
              "Membandingkan realisasi kinerja karyawan dengan standar target yang ditetapkan.",
              "Mencatat kendala utama karyawan yang gagal mencapai target kinerjanya.",
              "Mengikuti sesi evaluasi kinerja (appraisal interview) antara mentor dan staf."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu mengelola sistem administrasi kompensasi, upah lembur, dan hak-hak karyawan.",
            "indikator": [
              "Menghitung rekapitulasi akumulasi jam lembur tim/divisi.",
              "Membantu verifikasi dokumen pengajuan cuti atau klaim biaya operasional.",
              "Mempelajari dan menginput data komponen tunjangan atau insentif karyawan.",
              "Membantu administrasi pendaftaran atau klaim BPJS Kesehatan/Ketenagakerjaan.",
              "Memeriksa kesesuaian potongan denda keterlambatan dengan aturan slip gaji.",
              "Menyusun arsip slip gaji atau tanda terima kompensasi bulanan."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu merencanakan dan mengevaluasi program pelatihan (training) peningkatan kapasitas SDM.",
            "indikator": [
              "Membantu menyiapkan akomodasi, ruang, materi, atau dokumen administrasi pelatihan.",
              "Menyebarkan dan merekap kuesioner evaluasi kepuasan pasca-pelatihan SDM.",
              "Mencatat perkembangan keterampilan karyawan setelah mengikuti program training.",
              "Menyusun daftar kebutuhan pelatihan (Training Needs Analysis) tingkat dasar.",
              "Membuat laporan dokumentasi foto dan berita acara pelaksanaan pelatihan."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu memetakan posisi dan situasi operasional instansi menggunakan metode SWOT analitis.",
            "indikator": [
              "Mengidentifikasi keunggulan internal dan kekuatan sistem kerja divisi.",
              "Menemukan dan mencatat kelemahan operasional yang menghambat produktivitas.",
              "Memetakan peluang eksternal yang bisa dimanfaatkan oleh perusahaan.",
              "Mengidentifikasi ancaman dari luar (regulasi/kompetitor) terhadap instansi.",
              "Menyusun draf matriks SWOT lengkap berdasarkan temuan harian di kantor."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu berkontribusi dalam perumusan rencana aksi, visi, misi, dan taktik kerja divisi.",
            "indikator": [
              "Mengikuti rapat strategis bulanan dan merangkum notulen secara terstruktur.",
              "Memberikan usulan tertulis untuk taktik peningkatan efisiensi kerja tim.",
              "Membantu memecah target besar tahunan menjadi target mingguan divisi.",
              "Menyusun draf urutan prioritas program kerja (Timeline Action Plan).",
              "Mendokumentasikan revisi visi-misi divisi sesuai arah kebijakan baru."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu mengawal implementasi dan eksekusi program kerja strategis perusahaan.",
            "indikator": [
              "Terlibat langsung dalam eksekusi campaign, promo, atau program layanan baru.",
              "Membantu sosialisasi panduan atau SOP baru kepada staf atau pengguna layanan.",
              "Mengoordinasikan pembagian tugas lapangan dengan tim eksekutor.",
              "Memastikan ketersediaan fasilitas pendukung sebelum program kerja dimulai.",
              "Menangani kendala teknis mendadak di lapangan saat eksekusi strategi berlangsung."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu melakukan pengawasan, audit kesesuaian rencana, dan monitoring berkala.",
            "indikator": [
              "Melakukan audit kecocokan stok fisik barang dengan data di sistem aplikasi.",
              "Memeriksa kelengkapan berkas administrasi berkala agar sesuai standar.",
              "Membuat laporan progres (milestone tracking) ketercapaian program kerja.",
              "Mengawasi kepatuhan staf di lapangan terhadap anggaran biaya yang ditentukan.",
              "Melaporkan penyimpangan (variance) antara rencana awal dengan realisasi."
            ]
          },
          {
            "nama_cpmk": "CPMK 5: Mahasiswa mampu memberikan rekomendasi perbaikan berkelanjutan (Continuous Improvement).",
            "indikator": [
              "Membuat laporan evaluasi keberhasilan atau kegagalan program mingguan.",
              "Menyusun draf rekomendasi perbaikan untuk siklus program berikutnya.",
              "Mengusulkan otomatisasi pada alur birokrasi kerja yang dianggap lambat.",
              "Menyusun panduan singkat (tips & triks) penyelesaian tugas operasional harian."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu menerapkan standar pelayanan prima (Service Excellence) pada garda depan ritel.",
            "indikator": [
              "Melayani konsultasi, keluhan, atau transaksi pelanggan langsung di garda depan.",
              "Memastikan kecepatan, ketepatan, dan keramahan penanganan konsumen.",
              "Menerapkan standar 5S (Senyum, Sapa, Salam, Sopan, Santun) di tempat kerja.",
              "Menjelaskan informasi produk atau alur layanan kepada pengunjung dengan jelas.",
              "Membantu mengarahkan pelanggan ke counter atau divisi yang tepat."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu mengelola ketersediaan stok, persediaan barang, dan logistik ritel.",
            "indikator": [
              "Melakukan pengecekan berkala jumlah stok fisik barang atau form layanan.",
              "Membuat daftar pengajuan restock barang operasional yang sudah menipis.",
              "Menerima dan memeriksa kesesuaian barang masuk dari vendor dengan nota surat jalan.",
              "Mencatat data keluar masuk barang ke dalam sistem inventory/buku log.",
              "Mengidentifikasi barang yang lambat terjual (slow-moving) atau menumpuk di gudang."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu mengatur tata letak (Display Layout) dan kerapian visual produk/dokumen.",
            "indikator": [
              "Merapikan susunan dokumen, arsip, atau produk di area layanan agar mudah diakses.",
              "Menata papan informasi, brosur, atau media promosi agar terlihat jelas oleh pengunjung.",
              "Mengatur zonasi area tunggu pelanggan agar nyaman, bersih, dan higienis.",
              "Menerapkan metode FIFO (First In First Out) dalam penyusunan produk atau dokumen.",
              "Memastikan kebersihan etalase, meja layanan, dan perangkat kasir/garda depan."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu menganalisis perilaku belanja dan pola keluhan pelanggan ritel.",
            "indikator": [
              "Merekap dan mengelompokkan jenis komplain atau masukan konsumen harian.",
              "Menyusun ringkasan produk atau tipe layanan yang paling diminati sepanjang minggu.",
              "Mengamati jam-jam sibuk (peak hours) kunjungan pelanggan untuk antisipasi antrean.",
              "Membuat laporan kepuasan pelanggan sederhana berbasis wawancara singkat.",
              "Mengusulkan perbaikan fasilitas kenyamanan berdasarkan keluhan terbanyak."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu mengidentifikasi potensi bahaya (Hazard) dan risiko operasional di area kerja.",
            "indikator": [
              "Melakukan inspeksi berkala terhadap kelayakan fasilitas kerja atau keamanan kantor/gudang.",
              "Mendata aset penting, perangkat elektronik, atau data digital yang rawan rusak/hilang.",
              "Menemukan titik rawan kecelakaan kerja, korsleting listrik, atau kebocoran data.",
              "Mencatat kelalaian staf dalam penerapan prosedur standar operasional kerja.",
              "Menyusun draf daftar register risiko (Risk Register) awal unit penempatan."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu menganalisis tingkat dampak, frekuensi, dan taksiran kerugian insiden.",
            "indikator": [
              "Menghitung perkiraan kerugian waktu atau biaya akibat kesalahan sistem/data.",
              "Memetakan risiko berdasarkan matriks frekuensi vs tingkat keparahan (severity).",
              "Menganalisis riwayat kerugian atau komplain besar yang pernah terjadi di masa lalu.",
              "Mengelompokkan risiko ke dalam kategori risiko rendah, sedang, atau kritis.",
              "Mendiskusikan dampak finansial insiden operasional bersama mentor lapangan."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu menerapkan prosedur tindakan mitigasi, K3, dan kontrol pengamanan.",
            "indikator": [
              "Menjalankan tindakan pencegahan seperti backup data berkala atau merapikan arsip.",
              "Membantu pemasangan, pengecekan, atau pembaharuan alat keselamatan/APAR di kantor.",
              "Mengatur ulang hak akses password data penting untuk mencegah kebocoran informasi.",
              "Memastikan jalur evakuasi darurat di kantor terbebas dari hambatan barang.",
              "Menerapkan double-check dokumen keuangan/operasional sebelum dikirim ke atasan."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu menyusun dokumen pelaporan, berita acara kejadian, dan respons krisis.",
            "indikator": [
              "Menulis kronologi lengkap (Berita Acara Kejadian) ketika terjadi masalah operasional.",
              "Mendokumentasikan bukti fisik atau digital dari aset yang mengalami gangguan/kerusakan.",
              "Membantu merumuskan draf langkah penanganan darurat saat krisis operasional terjadi.",
              "Menginput laporan insiden ke dalam database sistem manajemen risiko perusahaan.",
              "Menyusun bahan evaluasi pasca-insiden agar masalah serupa tidak terulang."
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
            "nama_cpmk": "CPMK 1: Mahasiswa mampu menunjukkan sikap inisiatif, kemandirian, dan tanggung jawab tinggi atas penugasan.",
            "indikator": [
              "Mengambil inisiatif menyelesaikan tugas mandiri tanpa perlu diawasi secara ketat.",
              "Bertanggung jawab mengoordinasikan penyelesaian target kelompok kerja magang.",
              "Bersedia mengambil alih tugas darurat rekan kerja yang sedang berhalangan hadir.",
              "Menyelesaikan pekerjaan tepat waktu dengan tingkat kesalahan minimal (zero defect).",
              "Mengajukan diri untuk memimpin sub-proyek atau agenda khusus dari mentor."
            ]
          },
          {
            "nama_cpmk": "CPMK 2: Mahasiswa mampu melakukan komunikasi efektif dan koordinasi lintas fungsi organisasi.",
            "indikator": [
              "Menyampaikan instruksi atau laporan progres kerja dengan sopan dan jelas kepada atasan.",
              "Melakukan koordinasi antar-divisi untuk kelancaran pertukaran data operasional.",
              "Menyusun draf surat keluar resmi atau email korespondensi bisnis yang profesional.",
              "Menjadi penghubung komunikasi yang baik antara pihak kampus (DPL) dan instansi (Mentor).",
              "Menggunakan bahasa tubuh dan artikulasi yang meyakinkan saat presentasi tim."
            ]
          },
          {
            "nama_cpmk": "CPMK 3: Mahasiswa mampu mengelola dinamika kelompok, memotivasi tim, dan menjembatani konflik.",
            "indikator": [
              "Membantu menengahi perbedaan pendapat antar rekan kerja dalam diskusi proyek.",
              "Menjaga motivasi dan suasana kerja tim tetap kondusif selama masa tenggat (deadline).",
              "Memberikan apresiasi dan dukungan moral atas keberhasilan kerja rekan satu tim.",
              "Membantu mengurai kebuntuan (ice breaking) saat rapat tim mengalami ketegangan.",
              "Mendorong partisipasi aktif dari seluruh anggota kelompok dalam menyelesaikan tugas."
            ]
          },
          {
            "nama_cpmk": "CPMK 4: Mahasiswa mampu mengatur delegasi tugas, pembagian porsi kerja, dan pengorganisasian tim.",
            "indikator": [
              "Membantu mentor lapangan membagi porsi kerja harian kepada anggota tim magang lain.",
              "Menyusun jadwal piket harian atau matriks tanggung jawab mingguan kelompok.",
              "Memantau beban kerja rekan tim agar terbagi secara adil dan merata.",
              "Menyusun draf struktur panitia kecil untuk pelaksanaan event internal instansi.",
              "Mengevaluasi kendala pembagian tugas yang tidak berjalan sesuai kesepakatan awal."
            ]
          },
          {
            "nama_cpmk": "CPMK 5: Mahasiswa mampu menjadi teladan (role model) dalam budaya disiplin dan etika profesional.",
            "indikator": [
              "Menjadi contoh dalam ketepatan waktu hadir di kantor dan kepatuhan jam istirahat.",
              "Menerapkan prinsip kerahasiaan data tingkat tinggi dan menjaga kode etik profesi.",
              "Menunjukkan integritas kejujuran penuh dalam melaporkan pengeluaran dana operasional.",
              "Menampilkan sikap tenang, rapi, dan profesional dalam kondisi tekanan kerja tinggi.",
              "Menghormati hierarki jabatan organisasi dan menghargai keberagaman di tempat kerja."
            ]
          }
        ]
      }
    ]
  }
];

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('mantaumagang');

    // Kosongkan PaketMatkul lama
    const resultDelete = await db.collection('paketmatkuls').deleteMany({});
    console.log(`Berhasil menghapus ${resultDelete.deletedCount} paket matkul lama.`);

    // Tambahkan createdAt, updatedAt untuk mongoose compatibility
    const docs = payload.map(p => ({
        ...p,
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    // Insert PaketMatkul baru
    const resultInsert = await db.collection('paketmatkuls').insertMany(docs);
    console.log(`Berhasil insert ${resultInsert.insertedCount} paket matkul baru.`);

  } finally {
    await client.close();
  }
}

run().catch(console.dir);
