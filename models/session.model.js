import mongoose from 'mongoose';
import { SESSION_STATUS } from '../config/constants.js';

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionCode: {
      type: String,
      unique: true,
      required: true,
    },
    qrCode: {
      type: String, // URL or base64 of QR code
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.ACTIVE,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
      },
    ],
    receipts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Receipt',
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'NPR',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sessionSchema.index({ sessionCode: 1 });
sessionSchema.index({ host: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
