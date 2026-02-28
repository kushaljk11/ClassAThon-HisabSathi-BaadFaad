/**
 * @file models/nudge.model.js
 * @description Nudge model — tracks payment reminder emails sent to participants.
 * Records delivery status and error info for debugging.
 */
import mongoose from "mongoose";

const nudgeSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NPR",
      trim: true,
    },
    dueDate: {
      type: String,
      default: "soon",
      trim: true,
    },
    payLink: {
      type: String,
      default: "#",
      trim: true,
    },
    paidByName: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Nudge = mongoose.model("Nudge", nudgeSchema);

export default Nudge;
