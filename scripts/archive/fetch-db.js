const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;
mongoose.connect(uri).then(async () => {
  const PaketMatkul = mongoose.model('PaketMatkul', new mongoose.Schema({}, { strict: false, collection: 'paketmatkuls' }));
  const pakets = await PaketMatkul.find().lean();
  console.log(JSON.stringify(pakets[0], null, 2));
  process.exit(0);
}).catch(console.error);
