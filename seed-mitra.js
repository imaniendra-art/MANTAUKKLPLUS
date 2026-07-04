const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";

const bumdesNames = [
  "BUMDes Sejahtera Appatanah", "BUMDes Amanah Bira", "BUMDes Karya Makmur Maros", "BUMDes Harapan Rakyat Gowa", "BUMDes Bina Mandiri Takalar",
  "BUMDes Maju Bersama Pangkep", "BUMDes Sumber Rejeki Barru", "BUMDes Tani Jaya Bone", "BUMDes Nelayan Mandiri Bulukumba", "BUMDes Wisata Rammang"
];

const swastaNames = [
  "Kalla Group", "Bosowa Corpora", "PT Pelindo (Persero) Regional 4", "PT Vale Indonesia Tbk", "PT GMTD Tbk",
  "Gojek Kantor Cabang Makassar", "PT Indofood CBP Sukses Makmur", "PT Japfa Comfeed Indonesia", "Phinisi Hospitality", "Nipah Mall & Office Building"
];

const pemerintahNames = [
  "Dinas Penanaman Modal & PTSP Sulsel", "Bapenda Kota Makassar", "Dinas Koperasi & UKM Provinsi Sulsel", "Dinas Tenaga Kerja Kota Makassar", "Kantor Wilayah DJP Sulselbartra"
];

const posisiTemplate = [
  { nama_posisi: "Staf Administrasi Keuangan", konsentrasi: "Keuangan", kuota: 3 },
  { nama_posisi: "Asisten Rekrutmen & SDM", konsentrasi: "SDM", kuota: 2 },
  { nama_posisi: "Digital Marketing Staff", konsentrasi: "Pemasaran", kuota: 4 },
  { nama_posisi: "Staf Riset & Kemitraan", konsentrasi: "Pengembangan Bisnis", kuota: 2 }
];

async function seedData() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('mantaumagang');
    
    console.log("Mereset data Mitra & Posisi...");
    await db.collection('mitramagangs').deleteMany({});
    await db.collection('posisimagangs').deleteMany({});

    const allMitraData = [];
    const allPosisiData = [];

    // 1. Generate BUMDes
    for (let i = 0; i < bumdesNames.length; i++) {
      const mitraId = new ObjectId();
      allMitraData.push({ _id: mitraId, nama_instansi: bumdesNames[i], jenis_skema: "wirausaha", kategori: "BUMDes", alamat: "Sulawesi Selatan", status_aktif: true, createdAt: new Date(), updatedAt: new Date() });
      
      if (i < 5) {
        allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Asisten Manager", konsentrasi: "Pengembangan Bisnis", kuota: 1, createdAt: new Date(), updatedAt: new Date() });
        allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Staf Keuangan Desa", konsentrasi: "Keuangan", kuota: 2, createdAt: new Date(), updatedAt: new Date() });
        allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Staf Pemasaran Produk Desa", konsentrasi: "Pemasaran", kuota: 2, createdAt: new Date(), updatedAt: new Date() });
      } else {
        for (const pos of posisiTemplate) {
          allPosisiData.push({ ...pos, mitra_id: mitraId, createdAt: new Date(), updatedAt: new Date() });
        }
      }
    }

    // 2. Generate Swasta
    for (const name of swastaNames) {
      const mitraId = new ObjectId();
      allMitraData.push({ _id: mitraId, nama_instansi: name, jenis_skema: "corporate", kategori: "Swasta", alamat: "Kota Makassar", status_aktif: true, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Business Development Analyst", konsentrasi: "Pengembangan Bisnis", kuota: 3, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Marketing Executive", konsentrasi: "Pemasaran", kuota: 5, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "HR Administrator", konsentrasi: "SDM", kuota: 2, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Finance & Accounting Staff", konsentrasi: "Keuangan", kuota: 2, createdAt: new Date(), updatedAt: new Date() });
    }

    // 4. Generate Pemerintah
    for (const name of pemerintahNames) {
      const mitraId = new ObjectId();
      allMitraData.push({ _id: mitraId, nama_instansi: name, jenis_skema: "Pemerintahan", kategori: "Pemerintah", alamat: "Provinsi Sulawesi Selatan", status_aktif: true, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Staf Pelayanan Publik", konsentrasi: "SDM", kuota: 4, createdAt: new Date(), updatedAt: new Date() });
      allPosisiData.push({ mitra_id: mitraId, nama_posisi: "Staf Administrasi Anggaran", konsentrasi: "Keuangan", kuota: 3, createdAt: new Date(), updatedAt: new Date() });
    }

    await db.collection('mitramagangs').insertMany(allMitraData);
    await db.collection('posisimagangs').insertMany(allPosisiData);

    console.log("25 Mitra dan ratusan Posisi Magang berhasil diinjeksi!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seedData();
