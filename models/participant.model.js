import mongoose from 'mongoose';
import { PARTICIPANT_STATUS, ROLES } from '../config/constants.js';

const participantSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PARTICIPANT,
    },
    status: {
      type: String,
      enum: Object.values(PARTICIPANT_STATUS),
      default: PARTICIPANT_STATUS.PENDING,
    },
    joinedAt: {
      type: Date,
    },
    totalOwed: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only be in a session once
participantSchema.index({ session: 1, user: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

export default Participant;
