/**
 * @file models/receipt.model.js
 * @description Receipt model — stores scanned or manually-entered bill data.
 * Contains line items, totals, and optional restaurant metadata.
 */
import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema(
  {
    restaurant: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
  },
  {
    timestamps: true,
  }
);

const Receipt = mongoose.model('Receipt', receiptSchema);

export default Receipt;
