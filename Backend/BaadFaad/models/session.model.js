import mongoose from "mongoose";

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

export default Session;
