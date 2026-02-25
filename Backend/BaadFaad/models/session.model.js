import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Session name is required'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
      },
    ],
    qrCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'splitting', 'finalized'],
      default: 'waiting',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a short session code before saving
sessionSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = 'BF-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
