import Split from '../models/split.model.js';
import Receipt from '../models/receipt.model.js';
import Participant from '../models/participant.model.js';
import { sendResponse } from '../utils/response.js';
import { calculateSplit } from '../utils/calculateSplit.js';
import { SPLIT_STATUS } from '../config/constants.js';

// @desc    Create a split
// @route   POST /api/splits
// @access  Private
export const createSplit = async (req, res) => {
  try {
    const { receiptId, splitType, breakdown, participants: bodyParticipants } = req.body;

    // Receipt is optional — if provided, look it up for totalAmount
    let receipt = null;
    let totalAmount = req.body.totalAmount || 0;
    if (receiptId) {
      receipt = await Receipt.findById(receiptId);
      if (!receipt) {
        return sendResponse(res, 404, false, 'Receipt not found');
      }
      totalAmount = receipt.totalAmount;
    }

    // Calculate split based on type
    let calculatedBreakdown;
    if (bodyParticipants && bodyParticipants.length > 0) {
      // Standalone mode: use participants sent from the frontend
      const perPerson = Math.round((totalAmount / bodyParticipants.length) * 100) / 100;
      calculatedBreakdown = bodyParticipants.map((p) => ({
        participant: p._id || undefined,
        user: p._id || undefined,
        name: p.name || 'Participant',
        amount: perPerson,
        percentage: Math.round((100 / bodyParticipants.length) * 100) / 100,
        items: [],
      }));
    } else {
      // Minimal mode: single-person split (self)
      calculatedBreakdown = [{
        name: 'You',
        amount: totalAmount,
        percentage: 100,
        items: [],
      }];
    }

    // Create split
    const split = await Split.create({
      receipt: receiptId || undefined,
      splitType: splitType || 'equal',
      breakdown: calculatedBreakdown,
      totalAmount,
      status: SPLIT_STATUS.CALCULATED,
      calculatedAt: new Date(),
    });

    sendResponse(res, 201, true, 'Split created successfully', { split });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get split by ID
// @route   GET /api/splits/:id
// @access  Private
export const getSplitById = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id)
      .populate('receipt')
      .populate('breakdown.user', 'name email avatar phone upiId')
      .populate('breakdown.participant');

    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    sendResponse(res, 200, true, 'Split fetched successfully', { split });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all splits
// @route   GET /api/splits
// @access  Private
export const getAllSplits = async (req, res) => {
  try {
    const splits = await Split.find()
      .populate('receipt')
      .sort({ createdAt: -1 })
      .limit(20);

    sendResponse(res, 200, true, 'Splits fetched successfully', { splits });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update split
// @route   PUT /api/splits/:id
// @access  Private
export const updateSplit = async (req, res) => {
  try {
    const { breakdown, status, notes } = req.body;

    const split = await Split.findById(req.params.id);
    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    if (breakdown) split.breakdown = breakdown;
    if (status) {
      split.status = status;
      if (status === SPLIT_STATUS.FINALIZED) {
        split.finalizedAt = new Date();
      }
    }
    if (notes) split.notes = notes;

    const updatedSplit = await split.save();

    sendResponse(res, 200, true, 'Split updated successfully', { split: updatedSplit });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Finalize split and create settlements
// @route   POST /api/splits/:id/finalize
// @access  Private
export const finalizeSplit = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id).populate('breakdown.user');

    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    if (split.status === SPLIT_STATUS.FINALIZED) {
      return sendResponse(res, 400, false, 'Split already finalized');
    }

    // Update participant totals
    for (const item of split.breakdown) {
      await Participant.findByIdAndUpdate(item.participant, {
        $inc: { totalOwed: item.amount },
      });
    }

    split.status = SPLIT_STATUS.FINALIZED;
    split.finalizedAt = new Date();
    await split.save();

    sendResponse(res, 200, true, 'Split finalized successfully', { split });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete split
// @route   DELETE /api/splits/:id
// @access  Private
export const deleteSplit = async (req, res) => {
  try {
    const split = await Split.findById(req.params.id);
    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    await split.deleteOne();
    sendResponse(res, 200, true, 'Split deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
