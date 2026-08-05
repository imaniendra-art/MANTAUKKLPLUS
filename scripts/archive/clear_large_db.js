const mongoose = require('mongoose');
const LaporanAkhir = require('./models/LaporanAkhir.js').default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await LaporanAkhir.updateMany(
    { _id: { $in: ['6a4e52879ad398fdd6f482a6', '6a4e5c909ad398fdd6f483c1'] } },
    { $set: { 
        file_pengantar: '', 
        file_penerimaan: '', 
        file_keterangan: '', 
        file_struktur_organisasi: '' 
    } }
  );
  
  console.log("Cleared large Base64 attachments");
  mongoose.disconnect();
}
run();
