import Receipt from '../models/receipt.model.js';

// @desc    Create a receipt (after scanning bill)
// @route   POST /api/receipts
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

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
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
