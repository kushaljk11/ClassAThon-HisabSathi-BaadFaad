import Settlement from '../models/settlement.model.js';
import Split from '../models/split.model.js';
import Session from '../models/session.model.js';
import { sendResponse } from '../utils/response.js';
import { SETTLEMENT_STATUS, PARTICIPANT_SETTLEMENT_STATUS, SPLIT_STATUS } from '../config/constants.js';

// @desc    Create settlement from a finalized split for a session
// @route   POST /api/settlements/session/:sessionId
// @access  Private
export const createSettlement = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Check if a settlement already exists for this session
    const existing = await Settlement.findOne({ session: sessionId });
    if (existing) {
      return sendResponse(res, 400, false, 'Settlement already exists for this session', { settlement: existing });
    }

    // Get the session to find the split
    const session = await Session.findById(sessionId);
    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    // Get the finalized split
    const split = await Split.findById(session.splitId)
      .populate('breakdown.user', 'name email')
      .populate('breakdown.participant', 'name email');

    if (!split) {
      return sendResponse(res, 404, false, 'Split not found for this session');
    }

    if (split.status !== SPLIT_STATUS.FINALIZED) {
      return sendResponse(res, 400, false, 'Split must be finalized before creating a settlement');
    }

    const totalExpense = split.totalAmount;

    // Build participant entries from the split breakdown
    const participants = split.breakdown.map((b) => {
      const name = b.user?.name || b.participant?.name || b.name || 'Participant';
      const email = b.user?.email || b.participant?.email || '';
      const share = b.amount;
      return {
        user: b.user?._id || undefined,
        participant: b.participant?._id || undefined,
        name,
        email,
        share,
        paid: 0,
        due: share,
        status: PARTICIPANT_SETTLEMENT_STATUS.DUE,
      };
    });

    const settlement = await Settlement.create({
      session: sessionId,
      split: split._id,
      totalExpense,
      totalCollected: 0,
      remaining: totalExpense,
      participants,
      status: SETTLEMENT_STATUS.ACTIVE,
      createdBy: req.user?.id || undefined,
    });

    sendResponse(res, 201, true, 'Settlement created successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get settlement for a session
// @route   GET /api/settlements/session/:sessionId
// @access  Private
export const getSessionSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findOne({ session: req.params.sessionId })
      .populate('session', 'name')
      .populate('split', 'splitType totalAmount');

    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found for this session');
    }

    sendResponse(res, 200, true, 'Settlement fetched successfully', { settlement });
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
      .populate('session', 'name')
      .populate('split', 'splitType totalAmount');

    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    sendResponse(res, 200, true, 'Settlement fetched successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Mark a participant as paid within a settlement
// @route   PUT /api/settlements/:id/participant/:participantId/pay
// @access  Private
export const markParticipantPaid = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const { amount } = req.body; // optional: partial payment amount

    const settlement = await Settlement.findById(id);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    const participant = settlement.participants.id(participantId);
    if (!participant) {
      return sendResponse(res, 404, false, 'Participant not found in this settlement');
    }

    // Calculate payment amount (full share by default, or partial)
    const paymentAmount = amount != null ? Number(amount) : participant.due;
    participant.paid = Math.min(participant.paid + paymentAmount, participant.share);
    participant.due = Math.max(participant.share - participant.paid, 0);
    participant.status = participant.due <= 0
      ? PARTICIPANT_SETTLEMENT_STATUS.PAID
      : PARTICIPANT_SETTLEMENT_STATUS.DUE;

    if (participant.due <= 0) {
      participant.paidAt = new Date();
    }

    // Recalculate totals
    settlement.totalCollected = settlement.participants.reduce((sum, p) => sum + p.paid, 0);
    settlement.remaining = settlement.totalExpense - settlement.totalCollected;

    await settlement.save();

    sendResponse(res, 200, true, 'Payment recorded successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Archive (finish) a settlement
// @route   PUT /api/settlements/:id/archive
// @access  Private
export const archiveSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    settlement.status = SETTLEMENT_STATUS.ARCHIVED;
    settlement.archivedAt = new Date();
    await settlement.save();

    sendResponse(res, 200, true, 'Settlement archived successfully', { settlement });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all settlements for the logged-in user
// @route   GET /api/settlements/my
// @access  Private
export const getMySettlements = async (req, res) => {
  try {
    const userId = req.user?.id;

    const settlements = await Settlement.find({
      $or: [
        { createdBy: userId },
        { 'participants.user': userId },
      ],
    })
      .populate('session', 'name')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Settlements fetched successfully', { settlements });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
