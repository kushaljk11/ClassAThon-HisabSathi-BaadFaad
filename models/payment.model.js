import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
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
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    screenshot: {
      type: String, // URL of payment proof
    },
    completedAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
paymentSchema.index({ settlement: 1 });
paymentSchema.index({ from: 1, to: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
