const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

const CpmkSchema = new mongoose.Schema({
  nama_cpmk: { type: String, required: true },
  indikator: [{ type: String }],
  saran_kegiatan: { type: String, default: "" },
});

const MatkulSchema = new mongoose.Schema({
  kode: { type: String, required: true },
  nama: { type: String, required: true },
  sks: { type: Number, required: true },
  dosen_pengampu: { type: String, default: "" },
  cpmk: [CpmkSchema],
});

const PaketMatkulSchema = new mongoose.Schema({
  nama_paket: String,
  jenis_skema: String,
  mata_kuliah: [MatkulSchema],
}, { timestamps: true });

mongoose.connect(uri).then(async () => {
  const PaketMatkul = mongoose.model('PaketMatkul', PaketMatkulSchema);
  const pakets = await PaketMatkul.find({});
  
  let updated = 0;
  for (let p of pakets) {
    let changed = false;
    for (let m of p.mata_kuliah) {
      if (!m._id) { m._id = new mongoose.Types.ObjectId(); changed = true; }
      for (let c of m.cpmk) {
        if (!c._id) { c._id = new mongoose.Types.ObjectId(); changed = true; }
      }
    }
    // Just saving will write the generated _ids back to mongo
    p.markModified('mata_kuliah');
    await p.save();
    updated++;
  }
  console.log(`Updated ${updated} pakets with persistent _ids.`);
  process.exit(0);
}).catch(console.error);
