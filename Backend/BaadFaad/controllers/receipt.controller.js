/**
 * @file controllers/receipt.controller.js
 * @description Receipt controller — handles creation and retrieval of
 * scanned/manual bill receipts stored in MongoDB.
 */
import Receipt from '../models/receipt.model.js';

/**
 * Create a receipt from scanned or manual bill data.
 * @route POST /api/receipts
 * @param {import('express').Request} req - body: { restaurant?, address?, items, totalAmount }
 * @param {import('express').Response} res
 */
export const createReceipt = async (req, res) => {
  try {
    const { restaurant, address, items, totalAmount } = req.body;

    if (!items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'items and totalAmount are required',
      });
    }

    const receipt = await Receipt.create({
      restaurant: restaurant || '',
      address: address || '',
      items,
      totalAmount,
    });

    res.status(201).json({ success: true, message: 'Receipt created', receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieve a receipt by its MongoDB _id.
 * @route GET /api/receipts/:id
 */
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }
    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
