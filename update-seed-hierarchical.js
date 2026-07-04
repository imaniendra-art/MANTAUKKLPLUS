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
        nama_paket: "Semester V - Magang Industri",
        jenis_skema: "instansi",
        mata_kuliah: [
          {
            kode: "STY. 501",
            nama: "Entrepreneurship: Prototyping & Project",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Mengidentifikasi peluang inovasi atau kebutuhan pengembangan layanan/proses bisnis baru di divisi tempat magang.", indikator: [] },
              { nama_cpmk: "CPMK-2: Merancang purwarupa (prototype) atau draf solusi awal untuk memecahkan masalah operasional yang ada.", indikator: [] },
              { nama_cpmk: "CPMK-3: Mengeksekusi dan menguji kelayakan dari proyek/ide inovasi yang diusulkan secara kolaboratif.", indikator: [] },
              { nama_cpmk: "CPMK-4: Menyusun laporan evaluasi dari proyek wirausaha/inovasi yang memberikan nilai tambah efisiensi bagi instansi.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 501",
            nama: "Teori Pengambilan Keputusan",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Menggunakan data dan informasi yang relevan sebagai landasan faktual dalam menghadapi sebuah kendala operasional.", indikator: [] },
              { nama_cpmk: "CPMK-2: Menganalisis berbagai alternatif solusi menggunakan pendekatan rasional dan alat ukur yang sesuai dengan kondisi perusahaan.", indikator: [] },
              { nama_cpmk: "CPMK-3: Merumuskan dan merekomendasikan keputusan taktis terbaik kepada atasan/mentor berdasarkan analisis risiko dan manfaat.", indikator: [] },
              { nama_cpmk: "CPMK-4: Mengevaluasi dampak dari keputusan yang telah dieksekusi terhadap kelancaran tugas harian tim.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 502",
            nama: "Manajemen Kinerja dan Kompensasi",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Mengelola dan merekapitulasi data kehadiran, keterlambatan, atau absensi harian di area kerjanya secara akurat.", indikator: [] },
              { nama_cpmk: "CPMK-2: Mengukur dan memonitor pencapaian target kerja (KPI) harian/mingguan dari individu atau tim.", indikator: [] },
              { nama_cpmk: "CPMK-3: Membantu proses administrasi yang berkaitan dengan hak kompensasi, seperti rekapitulasi lembur, cuti, atau klaim operasional.", indikator: [] },
              { nama_cpmk: "CPMK-4: Menyusun rekap laporan evaluasi kinerja karyawan sebagai bahan pertimbangan apresiasi atau perbaikan kerja.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 503",
            nama: "Manajemen Strategi",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Memetakan kekuatan, kelemahan, peluang, dan ancaman (SWOT) pada alur kerja di instansi penempatan.", indikator: [] },
              { nama_cpmk: "CPMK-2: Berpartisipasi aktif dalam rapat divisi untuk menyusun perencanaan program kerja atau strategi pencapaian target.", indikator: [] },
              { nama_cpmk: "CPMK-3: Mengimplementasikan dan mengawal eksekusi taktik/program kerja yang telah disetujui manajemen.", indikator: [] },
              { nama_cpmk: "CPMK-4: Melakukan audit atau pengawasan terhadap kesesuaian antara rencana strategis awal dengan pelaksanaan di lapangan.", indikator: [] },
              { nama_cpmk: "CPMK-5: Memberikan usulan perbaikan (continuous improvement) berdasarkan evaluasi strategi yang telah berjalan.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 404",
            nama: "Manajemen Ritel",
            sks: 2,
            cpmk: [
              { nama_cpmk: "CPMK-1: Melaksanakan standar pelayanan prima (service excellence) saat berinteraksi langsung dengan klien atau pelanggan instansi.", indikator: [] },
              { nama_cpmk: "CPMK-2: Memantau, mendata, dan menjaga ketersediaan stok barang fisik maupun dokumen operasional layanan harian.", indikator: [] },
              { nama_cpmk: "CPMK-3: Mengelola tata letak (display) area kerja atau area pelayanan agar selalu efisien, rapi, dan sesuai standar perusahaan.", indikator: [] },
              { nama_cpmk: "CPMK-4: Menganalisis pola keluhan atau kebutuhan pelanggan untuk meningkatkan kualitas garda terdepan layanan.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 405",
            nama: "Manajemen Risiko",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Mengidentifikasi potensi bahaya (hazard), risiko kecelakaan, atau risiko kesalahan data operasional di lingkungan kerja.", indikator: [] },
              { nama_cpmk: "CPMK-2: Menganalisis tingkat dampak dan kerugian dari sebuah insiden atau komplain operasional yang terjadi.", indikator: [] },
              { nama_cpmk: "CPMK-3: Menerapkan prosedur tindakan mitigasi, K3 (Kesehatan dan Keselamatan Kerja), atau pencegahan kerugian di lapangan.", indikator: [] },
              { nama_cpmk: "CPMK-4: Menyusun berita acara atau laporan kronologi insiden sebagai bahan evaluasi manajemen risiko instansi.", indikator: [] }
            ]
          },
          {
            kode: "MNJ. 602",
            nama: "Manajemen Kepemimpinan Bisnis dan Organisasi",
            sks: 3,
            cpmk: [
              { nama_cpmk: "CPMK-1: Menunjukkan sikap inisiatif dan tanggung jawab yang tinggi saat memimpin penyelesaian tugas spesifik di divisinya.", indikator: [] },
              { nama_cpmk: "CPMK-2: Mengkomunikasikan gagasan, instruksi kerja, atau evaluasi secara efektif dan sopan kepada rekan kerja maupun atasan.", indikator: [] },
              { nama_cpmk: "CPMK-3: Mengelola dinamika kelompok dan menjembatani konflik ringan di dalam tim kerja untuk menjaga produktivitas.", indikator: [] },
              { nama_cpmk: "CPMK-4: Mengorganisir pembagian tugas dan memastikan kelancaran koordinasi antar anggota divisi.", indikator: [] },
              { nama_cpmk: "CPMK-5: Menjadi teladan (role model) dalam penerapan budaya disiplin, etika profesi, dan tata tertib instansi.", indikator: [] }
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
      // Needs to handle adding indicator to a specific CPMK
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
      // Custom endpoint to add new CPMK
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
console.log("Auto-seed script updated successfully.");
