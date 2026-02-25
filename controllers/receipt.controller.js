import Receipt from '../models/receipt.model.js';
import Session from '../models/session.model.js';
import { sendResponse } from '../utils/response.js';

// @desc    Upload a receipt
// @route   POST /api/receipts
// @access  Private
export const uploadReceipt = async (req, res) => {
  try {
    const { sessionId, imageUrl, merchantName, totalAmount, tax, discount, items, ocrData } = req.body;
    const userId = req.user.id;

    // Check if session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    // Create receipt
    const receipt = await Receipt.create({
      session: sessionId,
      uploadedBy: userId,
      imageUrl,
      merchantName,
      totalAmount,
      tax: tax || 0,
      discount: discount || 0,
      items: items || [],
      ocrData,
      isProcessed: items && items.length > 0,
    });

    // Add to session
    session.receipts.push(receipt._id);
    session.totalAmount += totalAmount;
    await session.save();

    await receipt.populate('uploadedBy', 'name email');

    sendResponse(res, 201, true, 'Receipt uploaded successfully', { receipt });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
export const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('uploadedBy', 'name email avatar')
      .populate('session', 'title sessionCode');

    if (!receipt) {
      return sendResponse(res, 404, false, 'Receipt not found');
    }

    sendResponse(res, 200, true, 'Receipt fetched successfully', { receipt });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get receipts for a session
// @route   GET /api/receipts/session/:sessionId
// @access  Private
export const getSessionReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ session: req.params.sessionId })
      .populate('uploadedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Receipts fetched successfully', { receipts });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update receipt
// @route   PUT /api/receipts/:id
// @access  Private
export const updateReceipt = async (req, res) => {
  try {
    const { merchantName, totalAmount, tax, discount, items, isProcessed } = req.body;

    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return sendResponse(res, 404, false, 'Receipt not found');
    }

    // Check if user uploaded the receipt
    if (receipt.uploadedBy.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Not authorized to update this receipt');
    }

    if (merchantName) receipt.merchantName = merchantName;
    if (totalAmount !== undefined) receipt.totalAmount = totalAmount;
    if (tax !== undefined) receipt.tax = tax;
    if (discount !== undefined) receipt.discount = discount;
    if (items) receipt.items = items;
    if (isProcessed !== undefined) receipt.isProcessed = isProcessed;

    const updatedReceipt = await receipt.save();

    sendResponse(res, 200, true, 'Receipt updated successfully', { receipt: updatedReceipt });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete receipt
// @route   DELETE /api/receipts/:id
// @access  Private
export const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return sendResponse(res, 404, false, 'Receipt not found');
    }

    // Check if user uploaded the receipt
    if (receipt.uploadedBy.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Not authorized to delete this receipt');
    }

    // Remove from session
    await Session.findByIdAndUpdate(receipt.session, {
      $pull: { receipts: receipt._id },
      $inc: { totalAmount: -receipt.totalAmount },
    });

    await receipt.deleteOne();
    sendResponse(res, 200, true, 'Receipt deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
