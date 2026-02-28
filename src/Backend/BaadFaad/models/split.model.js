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
        paidByName: {
          type: String,
          default: '',
        },
        paidById: {
          type: String,
          default: '',
        },
        paidForId: {
          type: String,
          default: '',
        },
        paymentStatus: {
          type: String,
          enum: ['unpaid', 'partial', 'paid'],
          default: 'unpaid',
        },
        // NOTE: `amountPaid` is no longer a source-of-truth. Payments are
        // stored at the split level as `payments` with allocations. We keep
        // compatibility by computing `amountPaid` dynamically in controllers.
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

// Payments at the split level. Each payment is a single incoming payment made
// by `paidBy` and split into one or more `allocations` (paidFor => amount).
splitSchema.add({
  payments: [
    {
      amount: { type: Number, default: 0 },
      paidBy: {
        // store minimal payer info (id or name/email) so templates can use it
        id: { type: mongoose.Schema.Types.Mixed, default: null },
        name: { type: String, default: '' },
        email: { type: String, default: '' },
      },
      allocations: [
        {
          // paidFor can be a user _id (ObjectId) or a name/email string
          paidFor: { type: mongoose.Schema.Types.Mixed },
          paidForName: { type: String, default: '' },
          paidForEmail: { type: String, default: '' },
          amount: { type: Number, default: 0 },
        },
      ],
      note: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Index for faster queries
splitSchema.index({ receipt: 1 });

const Split = mongoose.model('Split', splitSchema);

export default Split;
