// No dotenv
const mongoose = require('mongoose');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const PokjaSchema = new mongoose.Schema({
      periode: { type: String },
    }, { strict: false });
    const Pokja = mongoose.models.Pokja || mongoose.model('Pokja', PokjaSchema);

    const SystemSettingsSchema = new mongoose.Schema({
      periode_aktif: { type: String },
    }, { strict: false });
    const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);

    let settings = await SystemSettings.findOne({});
    const activePeriode = settings?.periode_aktif || "Ganjil 2026/2027";
    
    // Set all Pokjas that don't have periode or have empty periode to activePeriode
    const result = await Pokja.updateMany(
      { $or: [{ periode: { $exists: false } }, { periode: "" }] },
      { $set: { periode: activePeriode } }
    );
    
    console.log(`Migration done. Updated ${result.modifiedCount} Pokjas to periode: ${activePeriode}`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
