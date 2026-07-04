require('@next/env').loadEnvConfig('./');
const mongoose = require('mongoose');

// Define models inline to avoid ES module import issues
const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const PengajuanKKLSchema = new mongoose.Schema({}, { strict: false, collection: 'pengajuanmagangs' });
const PengajuanKKL = mongoose.models.PengajuanKKL || mongoose.model('PengajuanKKL', PengajuanKKLSchema);

const LogbookSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tanggal: Date,
  deskripsi_kegiatan: String,
  bukti_kegiatan: String,
  bukti_link: String,
  status_validasi: String,
  catatan_revisi: String,
  matched_indicators: Array
}, { timestamps: true, collection: 'logbooks' });
const Logbook = mongoose.models.Logbook || mongoose.model('Logbook', LogbookSchema);

const AbsensiSchema = new mongoose.Schema({
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tanggal: Date,
  status_kehadiran: String,
  jam_masuk: String,
  jam_keluar: String
}, { timestamps: true, collection: 'absensis' });
const Absensi = mongoose.models.Absensi || mongoose.model('Absensi', AbsensiSchema);

// Helper to generate random dummy text
const kegiatanDummies = [
  "Membantu tim menyiapkan bahan presentasi proyek untuk klien.",
  "Mempelajari sistem internal perusahaan dan dokumentasi API.",
  "Berdiskusi dengan mentor mengenai task minggu ini.",
  "Melakukan perbaikan bug pada modul frontend aplikasi.",
  "Menyusun laporan progress mingguan dan submit ke sistem.",
  "Ikut serta dalam rapat evaluasi tim mingguan.",
  "Membantu input data klien ke dalam database.",
  "Melakukan testing fitur baru sebelum dirilis ke staging.",
  "Mempelajari arsitektur database dan relasi antar tabel.",
  "Merancang mockup UI/UX untuk halaman dashboard admin."
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mantaumagang');
  console.log('Connected to DB');

  const dwi = await User.findOne({ nama_lengkap: /DWI ASTRIANTI/i, role: 'mahasiswa' });
  if (!dwi) { console.log('Dwi not found'); process.exit(0); return; }

  const pengajuan = await PengajuanKKL.findOne({ mahasiswa_id: dwi._id, status_pengajuan: 'disetujui' });
  if (!pengajuan) { console.log('Pengajuan not found'); process.exit(0); return; }

  console.log('Mahasiswa:', dwi.nama_lengkap);
  console.log('Pengajuan Start:', pengajuan.tanggal_mulai, 'End:', pengajuan.tanggal_selesai);

  // We will generate from start date up to today (or end date if it has passed)
  const start = new Date(pengajuan.tanggal_mulai);
  const end = new Date(pengajuan.tanggal_selesai);

  // Get existing logbook dates to avoid duplicates
  const existingLogbooks = await Logbook.find({ mahasiswa_id: dwi._id });
  const existingDates = new Set(existingLogbooks.map(l => {
    try {
      return l.tanggal.toISOString().split('T')[0];
    } catch(e) { return null; }
  }).filter(Boolean));

  let dateIterator = new Date(start);
  let addedCount = 0;

  while (dateIterator <= end) {
    const dateStr = dateIterator.toISOString().split('T')[0];
    
    // Skip weekends (0 is Sunday, 6 is Saturday)
    const day = dateIterator.getDay();
    if (day !== 0 && day !== 6 && !existingDates.has(dateStr)) {
      
      // Ensure there is absensi for this date
      const startOfDay = new Date(dateIterator);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateIterator);
      endOfDay.setUTCHours(23, 59, 59, 999);

      let absensi = await Absensi.findOne({ 
        mahasiswa_id: dwi._id, 
        tanggal: { $gte: startOfDay, $lte: endOfDay } 
      });

      if (!absensi) {
        absensi = new Absensi({
          mahasiswa_id: dwi._id,
          tanggal: new Date(dateIterator),
          status_kehadiran: 'hadir',
          jam_masuk: '08:00',
          jam_keluar: '17:00'
        });
        await absensi.save();
      }

      // Create dummy logbook
      const logbook = new Logbook({
        mahasiswa_id: dwi._id,
        tanggal: new Date(dateIterator),
        deskripsi_kegiatan: getRandomItem(kegiatanDummies),
        status_validasi: 'divalidasi_mentor',
        matched_indicators: [
          {
            indikator_id: new mongoose.Types.ObjectId(), // Dummy ID
            nama_cpmk: "CPMK Dummy " + Math.floor(Math.random() * 5 + 1),
            indikator: "Mahasiswa mampu mengaplikasikan ilmu yang didapat di perkuliahan ke dunia kerja nyata.",
            matkul_kode: "IF123",
            matkul_nama: "Matakuliah Magang",
            alasan: "Kegiatan ini sangat relevan dengan target karena melatih soft skill dan hard skill sekaligus."
          }
        ]
      });

      await logbook.save();
      addedCount++;
    }
    
    // Increment 1 day
    dateIterator.setDate(dateIterator.getDate() + 1);
  }

  console.log(`Successfully added ${addedCount} dummy logbooks.`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
