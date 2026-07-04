const fs = require('fs');

let routeCode = fs.readFileSync('app/api/paket-matkul/route.js', 'utf8');

const newSeedData = `      const dummy = await PaketMatkul.create({
        nama_paket: "Semester V - Magang Industri",
        jenis_skema: "instansi",
        daftar_matkul: [
          {
            kode: "STY. 501",
            nama: "Entrepreneurship: Prototyping & Project",
            sks: 3,
            cpmk_indikator: [
              "Mengidentifikasi peluang inovasi atau kebutuhan pengembangan layanan/proses bisnis baru di divisi tempat magang.",
              "Merancang purwarupa (prototype) atau draf solusi awal untuk memecahkan masalah operasional yang ada.",
              "Mengeksekusi dan menguji kelayakan dari proyek/ide inovasi yang diusulkan secara kolaboratif.",
              "Menyusun laporan evaluasi dari proyek wirausaha/inovasi yang memberikan nilai tambah efisiensi bagi instansi."
            ]
          },
          {
            kode: "MNJ. 501",
            nama: "Teori Pengambilan Keputusan",
            sks: 3,
            cpmk_indikator: [
              "Menggunakan data dan informasi yang relevan sebagai landasan faktual dalam menghadapi sebuah kendala operasional.",
              "Menganalisis berbagai alternatif solusi menggunakan pendekatan rasional dan alat ukur yang sesuai dengan kondisi perusahaan.",
              "Merumuskan dan merekomendasikan keputusan taktis terbaik kepada atasan/mentor berdasarkan analisis risiko dan manfaat.",
              "Mengevaluasi dampak dari keputusan yang telah dieksekusi terhadap kelancaran tugas harian tim."
            ]
          },
          {
            kode: "MNJ. 502",
            nama: "Manajemen Kinerja dan Kompensasi",
            sks: 3,
            cpmk_indikator: [
              "Mengelola dan merekapitulasi data kehadiran, keterlambatan, atau absensi harian di area kerjanya secara akurat.",
              "Mengukur dan memonitor pencapaian target kerja (KPI) harian/mingguan dari individu atau tim.",
              "Membantu proses administrasi yang berkaitan dengan hak kompensasi, seperti rekapitulasi lembur, cuti, atau klaim operasional.",
              "Menyusun rekap laporan evaluasi kinerja karyawan sebagai bahan pertimbangan apresiasi atau perbaikan kerja."
            ]
          },
          {
            kode: "MNJ. 503",
            nama: "Manajemen Strategi",
            sks: 3,
            cpmk_indikator: [
              "Memetakan kekuatan, kelemahan, peluang, dan ancaman (SWOT) pada alur kerja di instansi penempatan.",
              "Berpartisipasi aktif dalam rapat divisi untuk menyusun perencanaan program kerja atau strategi pencapaian target.",
              "Mengimplementasikan dan mengawal eksekusi taktik/program kerja yang telah disetujui manajemen.",
              "Melakukan audit atau pengawasan terhadap kesesuaian antara rencana strategis awal dengan pelaksanaan di lapangan.",
              "Memberikan usulan perbaikan (continuous improvement) berdasarkan evaluasi strategi yang telah berjalan."
            ]
          },
          {
            kode: "MNJ. 404",
            nama: "Manajemen Ritel",
            sks: 2,
            cpmk_indikator: [
              "Melaksanakan standar pelayanan prima (service excellence) saat berinteraksi langsung dengan klien atau pelanggan instansi.",
              "Memantau, mendata, dan menjaga ketersediaan stok barang fisik maupun dokumen operasional layanan harian.",
              "Mengelola tata letak (display) area kerja atau area pelayanan agar selalu efisien, rapi, dan sesuai standar perusahaan.",
              "Menganalisis pola keluhan atau kebutuhan pelanggan untuk meningkatkan kualitas garda terdepan layanan."
            ]
          },
          {
            kode: "MNJ. 405",
            nama: "Manajemen Risiko",
            sks: 3,
            cpmk_indikator: [
              "Mengidentifikasi potensi bahaya (hazard), risiko kecelakaan, atau risiko kesalahan data operasional di lingkungan kerja.",
              "Menganalisis tingkat dampak dan kerugian dari sebuah insiden atau komplain operasional yang terjadi.",
              "Menerapkan prosedur tindakan mitigasi, K3 (Kesehatan dan Keselamatan Kerja), atau pencegahan kerugian di lapangan.",
              "Menyusun berita acara atau laporan kronologi insiden sebagai bahan evaluasi manajemen risiko instansi."
            ]
          },
          {
            kode: "MNJ. 602",
            nama: "Manajemen Kepemimpinan Bisnis dan Organisasi",
            sks: 3,
            cpmk_indikator: [
              "Menunjukkan sikap inisiatif dan tanggung jawab yang tinggi saat memimpin penyelesaian tugas spesifik di divisinya.",
              "Mengkomunikasikan gagasan, instruksi kerja, atau evaluasi secara efektif dan sopan kepada rekan kerja maupun atasan.",
              "Mengelola dinamika kelompok dan menjembatani konflik ringan di dalam tim kerja untuk menjaga produktivitas.",
              "Mengorganisir pembagian tugas dan memastikan kelancaran koordinasi antar anggota divisi.",
              "Menjadi teladan (role model) dalam penerapan budaya disiplin, etika profesi, dan tata tertib instansi."
            ]
          }
        ]
      });`;

const regex = /const dummy = await PaketMatkul\.create\(\{[\s\S]*?\}\);/;
routeCode = routeCode.replace(regex, newSeedData);

fs.writeFileSync('app/api/paket-matkul/route.js', routeCode);
console.log("Auto-seed script updated successfully.");
