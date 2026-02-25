import Settlement from '../models/settlement.model.js';
import Participant from '../models/participant.model.js';
import Split from '../models/split.model.js';
import { sendResponse } from '../utils/response.js';
import { minimizeTransactions } from '../utils/minimizeTransactions.js';
import { SETTLEMENT_STATUS, SPLIT_STATUS } from '../config/constants.js';

// @desc    Create settlements for a session
// @route   POST /api/settlements/session/:sessionId
// @access  Private
export const createSettlements = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get all finalized splits for the session
    const splits = await Split.find({
      session: sessionId,
      status: SPLIT_STATUS.FINALIZED,
    }).populate('breakdown.participant breakdown.user');

    if (splits.length === 0) {
      return sendResponse(res, 400, false, 'No finalized splits found for this session');
    }

    // Get all participants
    const participants = await Participant.find({ session: sessionId }).populate('user');

    // Calculate who owes whom using minimizeTransactions utility
    const transactions = minimizeTransactions(participants);

    // Create settlements
    const settlements = await Promise.all(
      transactions.map((txn) =>
        Settlement.create({
          session: sessionId,
          from: txn.from,
          to: txn.to,
          amount: txn.amount,
          status: SETTLEMENT_STATUS.PENDING,
        })
      )
    );

    sendResponse(res, 201, true, 'Settlements created successfully', { settlements });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get settlement by ID
// @route   GET /api/settlements/:id
// @access  Private
export const getSettlementById = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id)
      .populate('from', 'name email avatar phone upiId bankDetails')
      .populate('to', 'name email avatar phone upiId bankDetails')
      .populate('session', 'title sessionCode')
      .populate('payment');

    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    sendResponse(res, 200, true, 'Settlement fetched successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get settlements for a session
// @route   GET /api/settlements/session/:sessionId
// @access  Private
export const getSessionSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ session: req.params.sessionId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Settlements fetched successfully', { settlements });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get settlements for a user
// @route   GET /api/settlements/user/:userId
// @access  Private
export const getUserSettlements = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const settlements = await Settlement.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('session', 'title sessionCode')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Settlements fetched successfully', { settlements });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Mark settlement as paid
// @route   PUT /api/settlements/:id/pay
// @access  Private
export const markAsPaid = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    // Check if user is the one who owes
    if (settlement.from.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Only the payer can mark as paid');
    }

    settlement.status = SETTLEMENT_STATUS.PAID;
    settlement.paidAt = new Date();
    if (req.body.notes) settlement.notes = req.body.notes;

    await settlement.save();

    sendResponse(res, 200, true, 'Settlement marked as paid', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Verify settlement
// @route   PUT /api/settlements/:id/verify
// @access  Private
export const verifySettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    // Check if user is the one receiving payment
    if (settlement.to.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Only the receiver can verify payment');
    }

    settlement.status = SETTLEMENT_STATUS.VERIFIED;
    settlement.verifiedAt = new Date();
    settlement.verifiedBy = req.user.id;

    await settlement.save();

    sendResponse(res, 200, true, 'Settlement verified successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Cancel settlement
// @route   PUT /api/settlements/:id/cancel
// @access  Private
export const cancelSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    settlement.status = SETTLEMENT_STATUS.CANCELLED;
    await settlement.save();

    sendResponse(res, 200, true, 'Settlement cancelled', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
