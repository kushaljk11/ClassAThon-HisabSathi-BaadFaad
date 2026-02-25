import mongoose from 'mongoose';
import { NUDGE_TYPE } from '../config/constants.js';

const nudgeSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    settlement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settlement',
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NUDGE_TYPE),
      default: NUDGE_TYPE.REMINDER,
    },
    message: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
nudgeSchema.index({ to: 1, isRead: 1 });
nudgeSchema.index({ settlement: 1 });

const Nudge = mongoose.model('Nudge', nudgeSchema);

export default Nudge;
