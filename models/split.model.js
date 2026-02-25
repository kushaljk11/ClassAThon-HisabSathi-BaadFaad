import mongoose from 'mongoose';
import { SPLIT_TYPE, SPLIT_STATUS } from '../config/constants.js';

const splitSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
      required: true,
    },
    splitType: {
      type: String,
      enum: Object.values(SPLIT_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SPLIT_STATUS),
      default: SPLIT_STATUS.PENDING,
    },
    breakdown: [
      {
        participant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Participant',
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        percentage: {
          type: Number,
        },
        items: [
          {
            itemId: mongoose.Schema.Types.ObjectId,
            itemName: String,
            itemPrice: Number,
            quantity: Number,
          },
        ],
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    calculatedAt: {
      type: Date,
    },
    finalizedAt: {
      type: Date,
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
splitSchema.index({ session: 1, receipt: 1 });

const Split = mongoose.model('Split', splitSchema);

export default Split;
