const mongoose = require('mongoose');
const LaporanAkhir = require('./models/LaporanAkhir.js').default;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Revert both to revisi so user can test
  await LaporanAkhir.updateMany(
    { _id: { $in: ['6a4e52879ad398fdd6f482a6', '6a4e5c909ad398fdd6f483c1'] } },
    { $set: { status: 'revisi' } }
  );
  
  console.log("Reverted to revisi");
  mongoose.disconnect();
}
run();
