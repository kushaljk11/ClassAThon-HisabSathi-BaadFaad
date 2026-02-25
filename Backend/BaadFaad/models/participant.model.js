import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    isHost: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Participant', participantSchema);
