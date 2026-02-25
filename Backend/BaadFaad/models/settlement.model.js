import mongoose from 'mongoose';
import { SETTLEMENT_STATUS, PARTICIPANT_SETTLEMENT_STATUS } from '../config/constants.js';

const settlementParticipantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    share: {
      type: Number,
      required: true,
    },
    paid: {
      type: Number,
      default: 0,
    },
    due: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PARTICIPANT_SETTLEMENT_STATUS),
      default: PARTICIPANT_SETTLEMENT_STATUS.DUE,
    },
    paidAt: {
      type: Date,
    },
  },
  { _id: true }
);

const settlementSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    split: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Split',
      required: true,
    },
    totalExpense: {
      type: Number,
      required: true,
    },
    totalCollected: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    participants: [settlementParticipantSchema],
    status: {
      type: String,
      enum: Object.values(SETTLEMENT_STATUS),
      default: SETTLEMENT_STATUS.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    archivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
settlementSchema.index({ session: 1 });
settlementSchema.index({ split: 1 });

const Settlement = mongoose.model('Settlement', settlementSchema);

export default Settlement;
