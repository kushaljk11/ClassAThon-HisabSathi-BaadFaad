import Receipt from '../models/receipt.model.js';
import Session from '../models/session.model.js';

// @desc    Create a receipt (after scanning bill)
// @route   POST /api/receipts
export const createReceipt = async (req, res) => {
  try {
    const { sessionId, restaurant, address, items, totalAmount } = req.body;

    if (!sessionId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, items and totalAmount are required',
      });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const receipt = await Receipt.create({
      session: sessionId,
      restaurant: restaurant || '',
      address: address || '',
      items,
      totalAmount,
    });

    // Update session total
    session.totalAmount = totalAmount;
    session.status = 'active';
    await session.save();

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

// @desc    Get receipts for a session
// @route   GET /api/receipts/session/:sessionId
export const getSessionReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ session: req.params.sessionId }).sort({ createdAt: -1 });
    res.json({ success: true, receipts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
