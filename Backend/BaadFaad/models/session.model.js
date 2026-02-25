/**
 * @file models/session.model.js
 * @description Session model — represents a live bill-splitting session.
 * Participants join via QR code; the first participant is the host.
 * Each session is linked to exactly one Split and expires after a configurable duration.
 */
import mongoose from "mongoose";

/** Default session lifetime before auto-expiry (hours). */
const DEFAULT_SESSION_DURATION_HOURS = Number(process.env.SESSION_DURATION_HOURS || 24);

const sessionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    splitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Split",
      required: true,
      unique: true,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Participant",
        },
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    qrCode: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: function () {
        const start = this.startDate ? new Date(this.startDate) : new Date();
        return new Date(start.getTime() + DEFAULT_SESSION_DURATION_HOURS * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model("Session", sessionSchema);

// Drop old indexes if they exist
Session.collection.dropIndex("sessionCode_1").catch(() => {
  // Ignore error if index doesn't exist
});

export default Session;
