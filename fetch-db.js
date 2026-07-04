const mongoose = require('mongoose');
const uri = "mongodb://mantaumagang:makassar123@ac-h9l3nb7-shard-00-00.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-01.uoswd69.mongodb.net:27017,ac-h9l3nb7-shard-00-02.uoswd69.mongodb.net:27017/mantaumagang?ssl=true&replicaSet=atlas-79ogl7-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(uri).then(async () => {
  const PaketMatkul = mongoose.model('PaketMatkul', new mongoose.Schema({}, { strict: false, collection: 'paketmatkuls' }));
  const pakets = await PaketMatkul.find().lean();
  console.log(JSON.stringify(pakets[0], null, 2));
  process.exit(0);
}).catch(console.error);
