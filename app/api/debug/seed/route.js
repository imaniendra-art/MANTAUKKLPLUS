import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MitraKKL from '@/models/MitraKKL';
import Pokja from '@/models/Pokja';
import Proker from '@/models/Proker';
import Logbook from '@/models/Logbook';
import User from '@/models/User';
import Penilaian from '@/models/Penilaian';
import LaporanAkhir from '@/models/LaporanAkhir';

export async function GET() {
  await dbConnect();
  try {
    // 0. Clean DB first
    await MitraKKL.deleteMany({});
    await Pokja.deleteMany({});
    await Proker.deleteMany({});
    await Logbook.deleteMany({});
    await LaporanAkhir.deleteMany({});
    await Penilaian.deleteMany({});

    // 1. Fetch DPLs and Mahasiswa
    const dpls = await User.find({ role: 'dpl' }).limit(2);
    if (dpls.length < 2) return NextResponse.json({ error: "Need at least 2 DPLs" }, { status: 400 });

    const mhs = await User.find({ role: 'mahasiswa' }).limit(10);
    if (mhs.length < 10) return NextResponse.json({ error: "Need at least 10 Mahasiswa" }, { status: 400 });

    // Ensure all these 10 users bypass the setup page
    for (let m of mhs) {
      m.is_setup_akun = true;
      m.nomor_hp = m.nomor_hp || '081234567890';
      await m.save();
    }

    // Split Mahasiswa
    const mhsGroup1 = mhs.slice(0, 5);
    const mhsGroup2 = mhs.slice(5, 10);

    const mitra1 = await MitraKKL.create({
      kategori: 'Pemerintahan & Desa (Sektor Publik)',
      nama_instansi: 'Pemerintah Desa Ciburial',
      deskripsi_singkat: 'Pemerintah Desa Ciburial, Kecamatan Cimenyan, Kabupaten Bandung.',
      alamat_lengkap: 'Jl. Raya Ciburial No. 1, Kec. Cimenyan, Kab. Bandung',
      kecamatan: 'Cimenyan',
      kabupaten_kota: 'Bandung',
      titik_koordinat: '-6.8456, 107.6358',
      link_maps: 'https://maps.google.com/?q=-6.8456,107.6358',
      nama_pimpinan: 'H. Ahmad Zulkifli',
      kontak_mitra: '081234567890',
      status_kerjasama: 'Memorandum of Understanding (MoU)',
      foto_kantor_desa: 'https://images.unsplash.com/photo-1577979313261-6893f6c8de41?q=80&w=1600',
      logo_mitra: 'https://placehold.co/400',
      kuota_maksimal: 5,
      is_lengkap: true
    });

    const mitra2 = await MitraKKL.create({
      kategori: 'Bisnis & Ekonomi Kerakyatan',
      nama_instansi: 'BUMDesa Tirta Mandiri Ponggok',
      deskripsi_singkat: 'BUMDes yang mengelola wisata Umbul Ponggok.',
      alamat_lengkap: 'Jl. Delanggu-Polanharjo, Ponggok, Kec. Polanharjo, Kab. Klaten',
      kecamatan: 'Polanharjo',
      kabupaten_kota: 'Klaten',
      titik_koordinat: '-7.6083, 110.6367',
      link_maps: 'https://maps.google.com/?q=-7.6083,110.6367',
      nama_pimpinan: 'Junaedhi Mulyono',
      kontak_mitra: '081298765432',
      status_kerjasama: 'Belum Ada',
      foto_kantor_bumdes: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600',
      logo_mitra: 'https://placehold.co/400',
      kuota_maksimal: 5,
      is_lengkap: true
    });

    // 3. Create Pokja
    const pokja1 = await Pokja.create({
      nama_pokja: 'Tim KKL Ciburial Digital',
      dpl_id: dpls[0]._id,
      mitra_id: mitra1._id,
      ketua_id: mhsGroup1[0]._id,
      anggota: mhsGroup1.map((m, i) => ({
        user_id: m._id,
        is_ketua: i === 0,
        status_undangan: 'bergabung',
        tanggal_bergabung: new Date('2026-06-25')
      })),
      status_pokja: 'selesai'
    });

    const pokja2 = await Pokja.create({
      nama_pokja: 'Tim KKL BUMDes Ponggok',
      dpl_id: dpls[1]._id,
      mitra_id: mitra2._id,
      ketua_id: mhsGroup2[0]._id,
      anggota: mhsGroup2.map((m, i) => ({
        user_id: m._id,
        is_ketua: i === 0,
        status_undangan: 'bergabung',
        tanggal_bergabung: new Date('2026-06-26')
      })),
      status_pokja: 'selesai'
    });

    // 4. Create Proker
    const prokerG1_1 = await Proker.create({ pokja_id: pokja1._id, judul_proker: 'Pengembangan Sistem Informasi Geografis Potensi Desa', deskripsi: 'Membangun SIG untuk pemetaan potensi unggulan desa berbasis web.', jenis_proker: 'Utama', target_dampak: 'Aparatur Desa dan Masyarakat Umum', pic_id: mhsGroup1[0]._id, status_pelaksanaan: 'Selesai', status: 'selesai', tanggal_mulai: new Date('2026-07-01'), tanggal_selesai: new Date('2026-07-20') });
    const prokerG1_2 = await Proker.create({ pokja_id: pokja1._id, judul_proker: 'Pelatihan Literasi Digital Perangkat Desa', deskripsi: 'Memberikan pelatihan Microsoft Office dan penggunaan email profesional untuk perangkat desa.', jenis_proker: 'Pendukung', target_dampak: 'Aparatur Desa', pic_id: mhsGroup1[1]._id, status_pelaksanaan: 'Selesai', status: 'selesai', tanggal_mulai: new Date('2026-07-21'), tanggal_selesai: new Date('2026-08-10') });

    const prokerG2_1 = await Proker.create({ pokja_id: pokja2._id, judul_proker: 'Pembuatan E-Commerce BUMDes', deskripsi: 'Membangun website e-commerce untuk produk-produk UMKM yang dikelola oleh BUMDes.', jenis_proker: 'Utama', target_dampak: 'Pengurus BUMDes dan Pelaku UMKM', pic_id: mhsGroup2[0]._id, status_pelaksanaan: 'Selesai', status: 'selesai', tanggal_mulai: new Date('2026-07-01'), tanggal_selesai: new Date('2026-07-20') });
    const prokerG2_2 = await Proker.create({ pokja_id: pokja2._id, judul_proker: 'Implementasi Sistem Point of Sale (POS)', deskripsi: 'Mengembangkan dan menerapkan sistem POS kasir untuk unit usaha minimarket BUMDes.', jenis_proker: 'Pendukung', target_dampak: 'Kasir dan Manajemen BUMDes', pic_id: mhsGroup2[1]._id, status_pelaksanaan: 'Selesai', status: 'selesai', tanggal_mulai: new Date('2026-07-21'), tanggal_selesai: new Date('2026-08-20') });

    // 5. Create Logbook (Just a few sample days per person to keep it performant, e.g. 5 days)
    // Actually the user wants 2 months, so ~60 days. That's a lot of docs. Let's do 60 docs per student.
    const start = new Date('2026-07-01');
    const logbooks = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d.getDay() === 0) continue; // Skip sunday
      
      // Group 1
      for (const m of mhsGroup1) {
        logbooks.push({
          tipe_logbook: 'individu',
          pokja_id: pokja1._id,
          mahasiswa_id: m._id,
          proker_id: i < 30 ? prokerG1_1._id : prokerG1_2._id,
          tanggal: d,
          rencana_target: 'Mengerjakan proker hari ini dengan target yang jelas',
          uraian_kegiatan: `Melaksanakan kegiatan ${i < 30 ? prokerG1_1.judul_proker : prokerG1_2.judul_proker} dengan fokus pada pengumpulan data, analisis kebutuhan, dan koordinasi bersama tim agar hasilnya sesuai dengan yang diharapkan oleh pihak instansi mitra.`,
          hasil_output: 'Data terkumpul, terstruktur, dan tervalidasi dengan baik.',
          kendala_solusi: 'Sempat hujan, ditunggu sampai reda.',
          bukti_kegiatan: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800',
          status_validasi: 'selesai'
        });
      }
      
      // Group 2
      for (const m of mhsGroup2) {
        logbooks.push({
          tipe_logbook: 'individu',
          pokja_id: pokja2._id,
          mahasiswa_id: m._id,
          proker_id: i < 30 ? prokerG2_1._id : prokerG2_2._id,
          tanggal: d,
          rencana_target: 'Mengerjakan rancangan sistem dan pengkodean',
          uraian_kegiatan: `Pengembangan kode dan desain antarmuka (UI/UX) untuk ${i < 30 ? prokerG2_1.judul_proker : prokerG2_2.judul_proker} berdasarkan umpan balik pengguna.`,
          hasil_output: 'Fitur aplikasi selesai dikembangkan dan lolos uji coba internal.',
          status_validasi: 'selesai'
        });
      }
    }
    await Logbook.insertMany(logbooks);

    // 6. Create Laporan Akhir
    const loremLaporan = `Laporan kegiatan KKL Plus ini dilaksanakan sebagai bentuk pengabdian kepada masyarakat yang berbasis pada keilmuan teknologi informasi. ` + `Kami melakukan banyak hal bermanfaat untuk institusi, melakukan pengamatan, perancangan, pengembangan, dan evaluasi berkelanjutan. `.repeat(150);
    
    await LaporanAkhir.create({
      tipe_laporan: 'pokja',
      pokja_id: pokja1._id,
      kata_pengantar: 'Puji syukur ke hadirat Tuhan YME atas selesainya laporan ini.',
      bab1_pendahuluan: loremLaporan,
      bab2_metode: loremLaporan,
      bab3_profil: loremLaporan,
      bab4_hasil: loremLaporan,
      bab5_penutup: 'Kesimpulan dari kegiatan ini adalah kami berhasil membawa dampak positif yang masif bagi masyarakat dan institusi mitra.',
      file_laporan: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy PDF link
      status: 'disetujui'
    });
    
    await LaporanAkhir.create({
      tipe_laporan: 'pokja',
      pokja_id: pokja2._id,
      kata_pengantar: 'Puji syukur ke hadirat Tuhan YME atas selesainya laporan ini.',
      bab1_pendahuluan: loremLaporan,
      bab2_metode: loremLaporan,
      bab3_profil: loremLaporan,
      bab4_hasil: loremLaporan,
      bab5_penutup: 'Kesimpulan dari kegiatan ini adalah kami berhasil membawa dampak positif yang masif.',
      file_laporan: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
      status: 'disetujui'
    });

    // 7. Penilaian (Grades)
    const calculateHuruf = (angka) => {
      if (angka >= 85) return 'A';
      if (angka >= 80) return 'A-';
      if (angka >= 75) return 'B+';
      if (angka >= 70) return 'B';
      if (angka >= 65) return 'B-';
      if (angka >= 60) return 'C+';
      if (angka >= 55) return 'C';
      if (angka >= 40) return 'D';
      return 'E';
    };

    // G1 -> High grades
    for (const m of mhsGroup1) {
      const finalScore = 93;
      await Penilaian.create({
        pokja_id: pokja1._id,
        mahasiswa_id: m._id,
        nilai_mentor_kelompok: 95,
        nilai_mentor_individu: 90,
        mentor_sudah_menilai: true,
        catatan_mentor: "Kerja yang luar biasa untuk desa.",
        nilai_dpl_kelompok: 95,
        nilai_dpl_individu: 92,
        dpl_sudah_menilai: true,
        catatan_dpl: "Sangat baik dan memuaskan.",
        nilai_akhir_angka: finalScore,
        nilai_akhir_huruf: calculateHuruf(finalScore),
        status_kelulusan: 'lulus'
      });
    }

    // G2 -> Bad/Mixed grades
    for (let i = 0; i < mhsGroup2.length; i++) {
      const m = mhsGroup2[i];
      const isBad = i > 2; // last 2 students get bad grades
      const score = isBad ? 65 : 85;
      const finalScore = isBad ? 66 : 84;
      
      await Penilaian.create({
        pokja_id: pokja2._id,
        mahasiswa_id: m._id,
        nilai_mentor_kelompok: score + 5,
        nilai_mentor_individu: score,
        mentor_sudah_menilai: true,
        catatan_mentor: isBad ? "Kurang disiplin datang." : "Cukup.",
        nilai_dpl_kelompok: score + 2,
        nilai_dpl_individu: score,
        dpl_sudah_menilai: true,
        catatan_dpl: isBad ? "Kurang aktif dan jarang bimbingan." : "Cukup baik.",
        nilai_akhir_angka: finalScore,
        nilai_akhir_huruf: calculateHuruf(finalScore),
        status_kelulusan: isBad ? 'tidak_lulus' : 'lulus'
      });
    }

    return NextResponse.json({ message: "Seed data created successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
