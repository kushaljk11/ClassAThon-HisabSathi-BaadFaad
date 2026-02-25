import Split from '../models/split.model.js';
import Receipt from '../models/receipt.model.js';
import Participant from '../models/participant.model.js';
import Session from '../models/session.model.js';
import { User } from '../models/userModel.js';
import { sendResponse } from '../utils/response.js';
import { calculateSplit } from '../utils/calculateSplit.js';
import { SPLIT_STATUS } from '../config/constants.js';

// @desc    Create a split
// @route   POST /api/splits
// @access  Private
export const createSplit = async (req, res) => {
  try {
    const { receiptId, splitType, breakdown, participants: bodyParticipants, name } = req.body;

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
      name: name || '',
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
    const { userId } = req.query;
    let filter = {};

    // If userId is provided, only return splits the user is part of
    if (userId) {
      // Find all sessions where this user is a participant
      const sessions = await Session.find({ 'participants.user': userId }).select('splitId name').lean();
      const splitIds = sessions.map((s) => s.splitId).filter(Boolean);

      // Also check breakdown.user directly on splits (for standalone splits)
      const directSplits = await Split.find({ 'breakdown.user': userId }).select('_id').lean();
      const directIds = directSplits.map((s) => s._id);

      const allIds = [...new Set([...splitIds.map(String), ...directIds.map(String)])];
      filter._id = { $in: allIds };
    }

    const splits = await Split.find(filter)
      .populate('receipt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Attach session name to each split for display
    if (splits.length > 0) {
      const splitIdsForSessions = splits.map((s) => s._id);
      const sessions = await Session.find({ splitId: { $in: splitIdsForSessions } })
        .select('splitId name')
        .lean();
      const sessionMap = {};
      for (const sess of sessions) {
        sessionMap[String(sess.splitId)] = sess.name;
      }
      for (const s of splits) {
        s.sessionName = sessionMap[String(s._id)] || '';
      }
    }

    sendResponse(res, 200, true, 'Splits fetched successfully', { splits });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update split (receipt, recalculate with session participants, or general update)
// @route   PUT /api/splits/:id
// @access  Private
export const updateSplit = async (req, res) => {
  try {
    const { receiptId, totalAmount, splitType, breakdown, status, notes, sessionId } = req.body;

    const split = await Split.findById(req.params.id);
    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    // If receiptId provided, attach it
    if (receiptId) split.receipt = receiptId;
    if (totalAmount !== undefined) split.totalAmount = totalAmount;
    if (splitType) split.splitType = splitType;
    if (notes) split.notes = notes;

    if (status) {
      split.status = status;
      if (status === SPLIT_STATUS.FINALIZED) {
        split.finalizedAt = new Date();
      }
    }

    // If we have a sessionId OR can look one up, recalculate breakdown from session participants
    const sessId = sessionId || null;
    let session = null;
    if (sessId) {
      session = await Session.findById(sessId)
        .populate('participants.user', 'name email')
        .populate('participants.participant', 'name email');
    } else {
      // Try to find session by splitId
      session = await Session.findOne({ splitId: req.params.id })
        .populate('participants.user', 'name email')
        .populate('participants.participant', 'name email');
    }

    if (session && session.participants.length > 0 && (receiptId || totalAmount !== undefined)) {
      // Recalculate equal split among session participants
      const total = split.totalAmount;
      const count = session.participants.length;
      const perPerson = Math.round((total / count) * 100) / 100;

      split.breakdown = session.participants.map((p) => {
        const userData = p.user || p.participant;
        const name = p.name || userData?.name || 'Participant';
        const email = p.email || userData?.email || '';
        return {
          user: typeof p.user === 'object' ? p.user?._id : p.user,
          participant: typeof p.participant === 'object' ? p.participant?._id : p.participant,
          name,
          email,
          amount: perPerson,
          amountPaid: 0,
          paymentStatus: 'unpaid',
          percentage: Math.round((100 / count) * 100) / 100,
          items: [],
        };
      });

      split.status = SPLIT_STATUS.CALCULATED;
      split.calculatedAt = new Date();
    } else if (breakdown) {
      // Manual breakdown override
      split.breakdown = breakdown;
    }

    const updatedSplit = await split.save();

    // Re-fetch with populated refs
    const populatedSplit = await Split.findById(updatedSplit._id)
      .populate('receipt')
      .populate('breakdown.user', 'name email')
      .populate('breakdown.participant', 'name email');

    sendResponse(res, 200, true, 'Split updated successfully', { split: populatedSplit });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update a single participant's payment (host only)
// @route   PUT /api/splits/:id/participant/:participantIndex
// @access  Private
export const updateParticipantPayment = async (req, res) => {
  try {
    const { amountPaid, paymentStatus } = req.body;
    const { id, participantIndex } = req.params;
    const idx = parseInt(participantIndex, 10);

    const split = await Split.findById(id);
    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

    if (idx < 0 || idx >= split.breakdown.length) {
      return sendResponse(res, 400, false, 'Invalid participant index');
    }

    if (amountPaid !== undefined) {
      split.breakdown[idx].amountPaid = amountPaid;
    }
    if (paymentStatus) {
      split.breakdown[idx].paymentStatus = paymentStatus;
    }

    // Auto-derive status if only amountPaid is sent
    if (amountPaid !== undefined && !paymentStatus) {
      const due = split.breakdown[idx].amount;
      if (amountPaid >= due) {
        split.breakdown[idx].paymentStatus = 'paid';
      } else if (amountPaid > 0) {
        split.breakdown[idx].paymentStatus = 'partial';
      } else {
        split.breakdown[idx].paymentStatus = 'unpaid';
      }
    }

    await split.save();

    const populatedSplit = await Split.findById(id)
      .populate('receipt')
      .populate('breakdown.user', 'name email')
      .populate('breakdown.participant', 'name email');

    sendResponse(res, 200, true, 'Participant payment updated', { split: populatedSplit });
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
