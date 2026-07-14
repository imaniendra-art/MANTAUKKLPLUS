import mongoose from "mongoose";

const MonevSchema = new mongoose.Schema({
  dpl_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pokja_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pokja",
    required: true,
  },
  jenis_kunjungan: {
    type: String,
    enum: ["Pengantaran", "Pertengahan", "Penarikan"],
    required: true,
  },
  tanggal_kunjungan: {
    type: Date,
    required: true,
  },
  catatan: {
    type: String,
    default: "",
  },
  foto_url: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Monev || mongoose.model("Monev", MonevSchema);
