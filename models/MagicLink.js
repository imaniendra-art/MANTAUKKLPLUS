import mongoose from 'mongoose';

const MagicLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  dpl_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logbook_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Logbook' }],
  pokja_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Pokja', required: true },
  status: { type: String, enum: ['active', 'used'], default: 'active' },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

delete mongoose.models.MagicLink;
export default mongoose.models.MagicLink || mongoose.model('MagicLink', MagicLinkSchema);
