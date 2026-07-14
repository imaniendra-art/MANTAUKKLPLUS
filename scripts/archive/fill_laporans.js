import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { MONGODB_URI } = process.env;

const LaporanSchema = new mongoose.Schema({
  tipe_laporan: String,
  pokja_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokja' },
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  kata_pengantar: String,
  bab1_pendahuluan: String,
  bab2_metode: String,
  bab3_profil: String,
  bab4_hasil: String,
  bab5_penutup: String,
  status: String,
  catatan_dpl: String
}, { collection: 'laporanakhirs' });

const PokjaSchema = new mongoose.Schema({
  nama_pokja: String,
  anggota: [{ user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  ketua_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'pokjas' });

const UserSchema = new mongoose.Schema({
  nama_lengkap: String,
  nim_nidn: String
}, { collection: 'users' });

async function fill() {
  await mongoose.connect(MONGODB_URI);
  const Pokja = mongoose.model('Pokja', PokjaSchema);
  const User = mongoose.model('User', UserSchema);
  const Laporan = mongoose.model('Laporan', LaporanSchema);

  const nims = ['2361201015', '2361201014', '2361201013', '2361201010'];
  
  const pokjas = await Pokja.find({}).populate('anggota.user_id ketua_id');
  const k1 = pokjas.find(p => p.nama_pokja.includes('1')) || pokjas[0];

  const generateLongText = (prefix, times) => {
    const sentence = "Kegiatan KKL Plus ini sangat bermanfaat bagi pengembangan kompetensi mahasiswa di lapangan. Kami belajar banyak mengenai administrasi desa, tata kelola perekonomian melalui BUMDes, serta pemberdayaan masyarakat lokal. Melalui interaksi dengan perangkat desa dan warga, mahasiswa mampu mengidentifikasi masalah nyata dan memberikan solusi strategis yang aplikatif. Secara teori dan praktik, ada banyak pelajaran berharga yang didapat dari program kerja ini, mulai dari digitalisasi, pemasaran produk unggulan, hingga manajemen keuangan usaha mikro. Pengalaman ini membentuk karakter kepemimpinan, kerja sama tim, dan kepedulian sosial yang tinggi. ";
    return prefix + "\n\n" + sentence.repeat(times);
  };

  for (const nim of nims) {
    const user = await User.findOne({ nim_nidn: nim });
    if (!user) continue;

    const sections = {
      bab1: [
        { id: '1_1', title: '1.1 Latar Belakang dan Rasionalisasi Pemilihan Mitra', content: generateLongText('Pemilihan mitra didasarkan pada potensi pengembangan desa dan BUMDes yang strategis. ', 20) },
        { id: '1_2', title: '1.2 Tujuan dan Manfaat Pelaksanaan KKL Plus', content: generateLongText('Tujuan pelaksanan KKL Plus adalah menerapkan tri dharma perguruan tinggi. ', 15) }
      ],
      bab2: [
        { id: '2_1', title: '2.1 Deskripsi Posisi dan Uraian Tugas (Job Description)', content: generateLongText('Sebagai anggota tim, tugas utamanya adalah membantu administrasi keuangan dan operasional BUMDes. ', 20) },
        { id: '2_2', title: '2.2 Observasi Budaya dan Lingkungan Kerja Mitra', content: generateLongText('Lingkungan kerja mitra sangat kondusif dan menjunjung tinggi nilai kekeluargaan serta gotong royong. ', 20) }
      ],
      bab3: [
        { id: '3_1', title: '3.1 Relevansi Praktik Kerja dengan Kerangka Teoretis', content: generateLongText('Praktik kerja di lapangan memiliki relevansi kuat dengan teori manajemen, terutama manajemen operasional dan SDM. ', 20) },
        { id: '3_2', title: '3.2 Identifikasi Kendala dan Strategi Pemecahan Masalah', content: generateLongText('Kendala utama yang dihadapi adalah kurangnya pemahaman digitalisasi pada sebagian masyarakat, yang kami selesaikan dengan pelatihan langsung. ', 20) },
        { id: '3_3', title: '3.3 Pengembangan Kompetensi Teknis dan Non-Teknis (Hard & Soft Skills)', content: generateLongText('Kompetensi teknis meningkat dalam hal penyusunan laporan, sedangkan soft skills meningkat dalam komunikasi massa. ', 20) }
      ],
      bab4: [
        { id: '4_1', title: '4.1 Kesimpulan', content: generateLongText('Kesimpulan dari seluruh kegiatan ini adalah bahwa KKL Plus terbukti sangat berdampak bagi mahasiswa maupun desa sasaran. ', 30) },
        { id: '4_2', title: '4.2 Evaluasi Diri dan Rekomendasi', content: generateLongText('Kami merekomendasikan agar ke depannya waktu pelaksanaan KKL Plus bisa lebih dimaksimalkan untuk penyelesaian program kerja. ', 30) }
      ]
    };

    const kataPengantar = generateLongText('Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas selesainya laporan ini. ', 15);

    const filter = { mahasiswa_id: user._id, tipe_laporan: 'individu' };
    const update = {
      $set: {
        pokja_id: k1._id,
        kata_pengantar: kataPengantar,
        bab1_pendahuluan: JSON.stringify(sections.bab1),
        bab2_metode: JSON.stringify(sections.bab2),
        bab3_profil: JSON.stringify(sections.bab3),
        bab4_hasil: JSON.stringify(sections.bab4),
        bab5_penutup: JSON.stringify([]),
        status: 'disetujui' // Already approved earlier, keep it approved
      }
    };

    await Laporan.updateOne(filter, update, { upsert: true });
    console.log(`Laporan individu untuk ${user.nama_lengkap} (${nim}) telah dimaksimalkan.`);
  }

  process.exit(0);
}

fill().catch(console.error);
