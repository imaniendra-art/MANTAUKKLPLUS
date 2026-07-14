const { MongoClient } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

const targetBumdes = [
  "BUMDes Sejahtera Appatanah", "BUMDes Amanah Bira", "BUMDes Karya Makmur Maros", 
  "BUMDes Harapan Rakyat Gowa", "BUMDes Bina Mandiri Takalar"
];

// Division Names
const namesSDM = ["Divisi HRD", "Staf Administrasi Kepegawaian", "Staf Pelayanan Publik", "Human Capital Staff"];
const namesKeuangan = ["Divisi Keuangan & Akuntansi", "Staf Anggaran", "Finance Staff", "Admin Keuangan Desa"];
const namesPemasaran = ["Divisi Pemasaran", "Digital Marketing", "Sales Executive", "Promosi & Sosmed"];
const namesPB = ["Divisi R&D", "Business Development", "Staf Riset", "Perencana Strategis"];

function getRandomName(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedPosisi() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mantaumagang');
    
    console.log("Mengambil data Mitra yang ada...");
    const mitras = await db.collection('mitramagangs').find({}).toArray();
    
    console.log("Mereset data PosisiKKL...");
    await db.collection('posisimagangs').deleteMany({});

    const allPosisiData = [];

    // Counters to ensure exactly 25 each
    const quotas = {
      SDM: 25,
      Keuangan: 25,
      Pemasaran: 25,
      PB: 25
    };

    // Distribution Plan:
    // Pemerintah (5 mitra * 4) = 20: 8 SDM, 8 Keuangan, 4 PB, 0 Pemasaran
    // Swasta (10 mitra * 4) = 40: 8 SDM, 7 Keuangan, 15 Pemasaran, 10 PB
    // BUMDes (10 mitra * 4) = 40: 9 SDM, 10 Keuangan, 10 Pemasaran, 11 PB

    let pemerintahPool = [
      ...Array(8).fill("SDM"), ...Array(8).fill("Keuangan"), ...Array(4).fill("PB")
    ];
    let swastaPool = [
      ...Array(8).fill("SDM"), ...Array(7).fill("Keuangan"), ...Array(15).fill("Pemasaran"), ...Array(10).fill("PB")
    ];
    // For BUMDes, we handle 5 Asisten Manager directly, so we need 6 PB left
    let bumdesPool = [
      ...Array(9).fill("SDM"), ...Array(10).fill("Keuangan"), ...Array(10).fill("Pemasaran"), ...Array(6).fill("PB")
    ];

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    pemerintahPool = shuffle(pemerintahPool);
    swastaPool = shuffle(swastaPool);
    bumdesPool = shuffle(bumdesPool);

    for (const mitra of mitras) {
      const isTop5Bumdes = targetBumdes.includes(mitra.nama_instansi);
      const isBumdes = mitra.kategori === 'BUMDes';
      const isPemerintah = mitra.kategori === 'Pemerintah';
      const isSwasta = mitra.kategori === 'Swasta';

      let mitraPosisi = [];

      if (isTop5Bumdes) {
        mitraPosisi.push({ konsentrasi: "Pengembangan Bisnis", nama_posisi: "Asisten Manager" });
        for (let i = 0; i < 3; i++) {
          const k = bumdesPool.pop();
          mitraPosisi.push({ konsentrasi: k === "PB" ? "Pengembangan Bisnis" : k, nama_posisi: getRandomName(k === "PB" ? namesPB : k === "SDM" ? namesSDM : k === "Keuangan" ? namesKeuangan : namesPemasaran) });
        }
      } else if (isBumdes) {
        for (let i = 0; i < 4; i++) {
          const k = bumdesPool.pop();
          mitraPosisi.push({ konsentrasi: k === "PB" ? "Pengembangan Bisnis" : k, nama_posisi: getRandomName(k === "PB" ? namesPB : k === "SDM" ? namesSDM : k === "Keuangan" ? namesKeuangan : namesPemasaran) });
        }
      } else if (isPemerintah) {
        for (let i = 0; i < 4; i++) {
          const k = pemerintahPool.pop();
          mitraPosisi.push({ konsentrasi: k === "PB" ? "Pengembangan Bisnis" : k, nama_posisi: getRandomName(k === "PB" ? namesPB : k === "SDM" ? namesSDM : k === "Keuangan" ? namesKeuangan : namesPemasaran) });
        }
      } else if (isSwasta) {
        for (let i = 0; i < 4; i++) {
          const k = swastaPool.pop();
          mitraPosisi.push({ konsentrasi: k === "PB" ? "Pengembangan Bisnis" : k, nama_posisi: getRandomName(k === "PB" ? namesPB : k === "SDM" ? namesSDM : k === "Keuangan" ? namesKeuangan : namesPemasaran) });
        }
      }

      // Add to array
      for (const pos of mitraPosisi) {
        allPosisiData.push({
          mitra_id: mitra._id,
          nama_posisi: pos.nama_posisi,
          konsentrasi: pos.konsentrasi,
          kuota: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await db.collection('posisimagangs').insertMany(allPosisiData);
    
    // Validasi Statistik
    const stats = { SDM: 0, Keuangan: 0, Pemasaran: 0, "Pengembangan Bisnis": 0 };
    allPosisiData.forEach(p => stats[p.konsentrasi]++);
    
    console.log(`Berhasil menginjeksi ${allPosisiData.length} Posisi Magang ke ${mitras.length} Mitra!`);
    console.log(`Statistik Distribusi Konsentrasi:`);
    console.log(stats);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seedPosisi();
