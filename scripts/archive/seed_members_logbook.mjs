import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Pokja from './models/Pokja.js';
import Proker from './models/Proker.js';
import Logbook from './models/Logbook.js';
import User from './models/User.js';

const POKJA_ID = '6a54637ece764ae77bdf0b25';
const START_DATE = new Date('2026-07-01');

// Kumpulan kalimat logbook realistis untuk variasi (kegiatan di BUMDes & Desa)
const personalActivities = [
  {
    rencana: 'Piket dan bersih-bersih kantor balai desa',
    uraian: 'Datang pagi hari, membantu perangkat desa menyiapkan ruang pelayanan, menyapu halaman, dan mengatur arsip surat masuk.',
    hasil: 'Kantor balai desa siap digunakan untuk pelayanan warga',
  },
  {
    rencana: 'Membantu pelayanan warga di loket balai desa',
    uraian: 'Membantu perangkat desa dalam melayani warga yang membuat surat keterangan domisili dan surat pengantar SKCK.',
    hasil: 'Terdapat 15 warga yang terbantu dalam pembuatan surat',
  },
  {
    rencana: 'Observasi potensi UMKM di Dusun I',
    uraian: 'Berkeliling di wilayah Dusun I, mewawancarai beberapa pelaku UMKM seperti pembuat keripik pisang dan anyaman bambu untuk pendataan BUMDes.',
    hasil: 'Mendapat 5 data UMKM baru yang potensial',
  },
  {
    rencana: 'Membantu pembukuan sederhana BUMDes',
    uraian: 'Mendampingi pengurus BUMDes untuk merapikan nota-nota pembelian barang dan mencatatnya ke dalam buku kas masuk dan keluar.',
    hasil: 'Buku kas BUMDes bulan lalu telah rapi dan seimbang',
  },
  {
    rencana: 'Rapat evaluasi mingguan dengan DPL (Daring) dan kelompok',
    uraian: 'Melaksanakan rapat via Google Meet dengan DPL untuk membahas progres minggu ini, serta rapat internal kelompok membahas target minggu depan.',
    hasil: 'Catatan evaluasi DPL dan pembagian tugas minggu depan',
  },
  {
    rencana: 'Kerja bakti membersihkan lingkungan masjid desa',
    uraian: 'Bergabung dengan warga desa, karang taruna, dan perangkat desa untuk kerja bakti jumat bersih di area masjid jami desa.',
    hasil: 'Lingkungan masjid bersih dan terjalin silaturahmi dengan warga',
  },
  {
    rencana: 'Sosialisasi program kerja ke Karang Taruna',
    uraian: 'Menghadiri pertemuan rutin karang taruna desa, memaparkan program kerja yang akan dilaksanakan, dan meminta dukungan pemuda desa.',
    hasil: 'Pemuda karang taruna bersedia menjadi relawan proker',
  },
  {
    rencana: 'Pendataan inventaris BUMDes',
    uraian: 'Melakukan pengecekan fisik barang-barang milik BUMDes yang ada di gudang, mencatat kondisi barang (rusak/baik) ke dalam form inventaris.',
    hasil: 'Data inventaris BUMDes terbaru berhasil didokumentasikan',
  },
  {
    rencana: 'Mengikuti kegiatan posyandu',
    uraian: 'Membantu bidan desa dan kader posyandu dalam menimbang balita, mengukur tinggi badan, dan mencatat data KMS warga.',
    hasil: 'Penyuluhan dan pendataan 30 balita selesai dilakukan',
  },
  {
    rencana: 'Mendesain poster untuk media sosial BUMDes',
    uraian: 'Membuat desain grafis menggunakan Canva untuk mempromosikan produk unggulan BUMDes di Instagram dan Facebook desa.',
    hasil: '2 Desain poster selesai dan siap diunggah',
  }
];

async function seedMembers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const pokja = await Pokja.findById(POKJA_ID).populate('anggota.user_id');
    
    if (!pokja) {
      console.log('POKJA tidak ditemukan');
      return;
    }

    // Ambil proker pendukung untuk kelompok ini (jika ada)
    const prokerList = await Proker.find({ pokja_id: POKJA_ID });
    const fallbackProkerId = prokerList.length > 0 ? prokerList[0]._id : null;

    // Gabungkan ketua ke dalam list members
    const allMembers = [...pokja.anggota];
    const isKetuaInAnggota = allMembers.some(a => String(a.user_id._id) === String(pokja.ketua_id._id));
    if (!isKetuaInAnggota) {
      allMembers.push({ user_id: pokja.ketua_id }); // Assume populated enough or at least has _id
    }

    const logbooksToInsert = [];

    for (const member of allMembers) {
      const mhsId = member.user_id._id;
      
      let currentDate = new Date(2026, 6, 1); // 1 Juli 2026
      let dayCounter = 1;

      for (let i = 1; i <= 45; i++) { // 45 hari kerja = 9 minggu = 2 bulan
        // Skip sabtu & minggu
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const randomAct = personalActivities[Math.floor(Math.random() * personalActivities.length)];

        // Tentukan status validasi (Simulasi untuk dites DPL & Mentor)
        // Setengahnya menunggu DPL, setengahnya menunggu Mentor
        let status = 'menunggu_dpl';
        if (i % 2 === 0) {
          status = 'menunggu_mentor'; 
        }

        const isProker = (i % 3 === 0) && prokerList.length > 0;
        const selectedProkerId = isProker ? prokerList[Math.floor(Math.random() * prokerList.length)]._id : null;
        
        logbooksToInsert.push({
          mahasiswa_id: mhsId,
          pokja_id: POKJA_ID,
          tipe_logbook: isProker ? 'pokja' : 'individu',
          proker_id: selectedProkerId,
          tanggal: new Date(currentDate),
          rencana_target: randomAct.rencana + (isProker ? ' (Tugas Proker)' : ''),
          uraian_kegiatan: randomAct.uraian,
          hasil_output: randomAct.hasil,
          kendala_solusi: (Math.random() > 0.7) ? 'Warga sulit dikumpulkan tepat waktu. Solusi: Menggunakan speaker masjid.' : '',
          bukti_kegiatan: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=400',
          keterangan_bukti: 'Dokumentasi kegiatan hari ini',
          status_validasi: status,
          komentar_dpl: '',
        });

        currentDate.setDate(currentDate.getDate() + 1);
        dayCounter++;
      }
    }

    // Bersihkan semua logbook lama di pokja ini agar tidak numpuk
    await Logbook.deleteMany({
      pokja_id: POKJA_ID
    });
    console.log(`Logbook lama untuk ${allMembers.length} anggota dihapus.`);

    // Insert massal
    await Logbook.insertMany(logbooksToInsert);
    console.log(`Berhasil menyisipkan ${logbooksToInsert.length} logbook realistis untuk anggota kelompok!`);

  } catch (error) {
    console.error('Error seeding members:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedMembers();
