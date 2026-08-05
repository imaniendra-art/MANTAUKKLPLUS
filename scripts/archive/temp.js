import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
const schema = new mongoose.Schema({ foto_kantor_desa: String, foto_kantor_bumdes: String }, { collection: 'mitrakkls' });
const Model = mongoose.model('MitraKKL', schema);
const data = await Model.find({}, { foto_kantor_desa: 1, foto_kantor_bumdes: 1 });
console.log(JSON.stringify(data, null, 2));
process.exit(0);
