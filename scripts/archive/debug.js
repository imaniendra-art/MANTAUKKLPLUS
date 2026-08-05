const mongoose = require('mongoose');

const LaporanAkhirSchema = new mongoose.Schema({
  tipe_laporan: { type: String, enum: ['individu', 'pokja'], required: true },
  pokja_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokja', required: true },
  mahasiswa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: function() { return this.tipe_laporan === 'individu'; } },
  kata_pengantar: { type: String, default: '' },
  bab1_pendahuluan: { type: String, default: '' },
  bab2_metode: { type: String, default: '' },
  bab3_profil: { type: String, default: '' },
  bab4_hasil: { type: String, default: '' },
  bab5_penutup: { type: String, default: '' },
  file_laporan: { type: String, default: '' },
  catatan_dpl: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'submitted', 'revisi', 'disetujui'], default: 'draft' }
}, { timestamps: true });

const LaporanAkhir = mongoose.model('LaporanAkhir', LaporanAkhirSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const l = await LaporanAkhir.findOne({ status: 'revisi' });
    if (!l) {
      console.log("No laporan in revisi");
      return;
    }
    console.log("Found:", l._id, l.tipe_laporan);
    l.status = 'submitted';
    const err = l.validateSync();
    if(err) {
      console.log("Validation error:", err);
    } else {
      await l.save();
      console.log("Saved successfully");
    }
  } catch (e) {
    console.log("Save failed:", e);
  }
  mongoose.disconnect();
}
run();
