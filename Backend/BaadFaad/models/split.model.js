/**
 * @file models/split.model.js
 * @description Split model — the core entity tracking how a bill is divided.
 * Contains the split type (equal / percentage / custom / item-based),
 * a per-participant breakdown with payment tracking, and lifecycle status.
 */
import mongoose from 'mongoose';
import { SPLIT_TYPE, SPLIT_STATUS } from '../config/constants.js';

const splitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
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
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        amount: {
          type: Number,
          required: true,
        },
        amountPaid: {
          type: Number,
          default: 0,
        },
        paymentStatus: {
          type: String,
          enum: ['unpaid', 'partial', 'paid'],
          default: 'unpaid',
        },
        name: {
          type: String,
        },
        email: {
          type: String,
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
splitSchema.index({ receipt: 1 });

const Split = mongoose.model('Split', splitSchema);

export default Split;
