/**
 * @file controllers/split.controller.js
 * @description Split controller — manages the full lifecycle of a bill split:
 * creation, retrieval, recalculation, per-participant payment updates,
 * and finalization. Supports equal, percentage, custom, and item-based splits.
 */
import Split from '../models/split.model.js';
import Receipt from '../models/receipt.model.js';
import Participant from '../models/participant.model.js';
import Session from '../models/session.model.js';
import Group from '../models/group.model.js';
import { User } from '../models/userModel.js';
import { sendResponse } from '../utils/response.js';
import { calculateSplit } from '../utils/calculateSplit.js';
import { SPLIT_STATUS } from '../config/constants.js';
import { getIO } from '../config/socket.js';
import { breakdownWithAllocations } from '../utils/paymentAllocations.js';

// helper: compute surplus flows along paidForId links
const applySurplusFlow = (breakdown) => {
  // build map of id->node
  const map = {}; const order = [];
  const uid = (b) =>
    (b.user && (b.user._id || b.user)) ||
    (b.participant && (b.participant._id || b.participant)) ||
    b._id || b.id || '';
  breakdown.forEach((b) => {
    const id = uid(b);
    map[id] = {
      share: Number(b.amount || 0),
      paid: Number(b.amountPaid || 0),
      paidFor: b.paidForId || '',
      received: 0,
      receivedFrom: [],
    };
    order.push(id);
  });

  let changed = true;
  while (changed) {
    changed = false;
    order.forEach((id) => {
      const node = map[id];
      if (!node) return;
      const total = node.paid + node.received;
      const surplus = Math.round((total - node.share + Number.EPSILON) * 100) / 100;
      if (surplus > 0 && node.paidFor) {
        const tgt = map[node.paidFor];
        if (tgt) {
          const before = tgt.received;
          tgt.received += surplus;
          if (tgt.received !== before) {
            tgt.paid += surplus;
            tgt.receivedFrom.push(id);
            changed = true;
          }
        }
      }
    });
  }

  return breakdown.map((b) => {
    const id = uid(b);
    const n = map[id] || {};
    return Object.assign({}, b, {
      surplusReceived: n.received || 0,
      surplusFrom: n.receivedFrom || [],
    });
  });
};

// Safe wrapper around breakdownWithAllocations to avoid throwing from unexpected
// or malformed split objects. Returns fallback breakdown on error.
const safeBreakdownWithAllocations = (split) => {
  try {
    const base = breakdownWithAllocations(split);
    return applySurplusFlow(base);
  } catch (e) {
    try {
      console.error('breakdownWithAllocations error:', e && e.message ? e.message : e);
    } catch (ee) {}
    return Array.isArray(split && split.breakdown) ? split.breakdown : [];
  }
};
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
        paidByName: '',
        percentage: Math.round((100 / bodyParticipants.length) * 100) / 100,
        items: [],
      }));
    } else {
      // Minimal mode: single-person split (self)
      calculatedBreakdown = [{
        name: 'You',
        amount: totalAmount,
        paidByName: '',
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

      // If there's no session but a group exists for this split, use group members
      if ((!session || session.participants.length === 0)) {
        try {
          const grp = await Group.findOne({ splitId: req.params.id })
            .populate('members', 'name fullName email')
            .populate('createdBy', 'name fullName email');
          if (grp && grp.members && grp.members.length > 0) {
            // Normalize group members into session-like participants
            session = { participants: grp.members.map((m) => ({ user: m._id || undefined, name: m.fullName || m.name || m.email || '', email: m.email || '' })) };
          }
        } catch (e) {
          // ignore group lookup errors — fallback to existing behavior
        }
      }
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
          paidByName: '',
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
    const { editorId, enforceHighestPayer } = req.body;
    const { id, participantIndex } = req.params;
    const idx = parseInt(participantIndex, 10);

    let split = await Split.findById(id);
    if (!split) {
      return sendResponse(res, 404, false, 'Split not found');
    }

      // If index is invalid, try to rebuild split.breakdown from session or group members
      if (idx < 0 || idx >= split.breakdown.length) {
        try {
          // Attempt to find session by splitId
          let session = await Session.findOne({ splitId: id })
            .populate('participants.user', 'name email')
            .populate('participants.participant', 'name email');

          if (!session || (session.participants || []).length === 0) {
            // Try group fallback
            const grp = await Group.findOne({ splitId: id }).populate('members', 'name fullName email');
            if (grp && grp.members && grp.members.length > 0) {
              // Build a session-like object
              session = { participants: grp.members.map((m) => ({ user: m._id || undefined, name: m.fullName || m.name || m.email || '', email: m.email || '' })) };
            }
          }

          if (session && session.participants && session.participants.length > 0) {
            const total = split.totalAmount || 0;
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

            await split.save();
          }
        } catch (rebuildErr) {
          // ignore rebuild errors and fall through to default response
          console.warn('Rebuild split.breakdown failed:', rebuildErr && rebuildErr.message);
        }
      }

      // Refresh local split after possible rebuild
      const refreshedSplit = await Split.findById(id);
      if (idx < 0 || idx >= (refreshedSplit.breakdown || []).length) {
        // Return helpful debug info
        const length = (refreshedSplit.breakdown || []).length;
        const ids = (refreshedSplit.breakdown || []).map((b) => b.user || b.participant || b._id || b.id || b.name || 'unknown');
        return sendResponse(res, 400, false, 'Invalid participant index', { requestedIndex: idx, breakdownLength: length, breakdownIds: ids });
      }

    // Continue with the latest split document after potential breakdown rebuild.
    split = refreshedSplit;

    if (enforceHighestPayer) {
      const rows = Array.isArray(split.breakdown) ? split.breakdown : [];
      const highest = rows
        .slice()
        .sort((a, b) => Number(b?.amountPaid || 0) - Number(a?.amountPaid || 0))[0] || null;
      const highestPaid = Number(highest?.amountPaid || 0);
      const highestId = String(
        (highest?.user && (highest.user._id || highest.user)) ||
        (highest?.participant && (highest.participant._id || highest.participant)) ||
        highest?._id ||
        ''
      );
      const actorId = String(editorId || '');

      if (!highestPaid || !highestId || !actorId || actorId !== highestId) {
        return sendResponse(res, 403, false, 'Only highest payer can edit balance due');
      }
    }

    if (amountPaid !== undefined) {
      split.breakdown[idx].amountPaid = Math.max(0, Number(amountPaid) || 0);
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

// @desc Ensure split includes ALL group members in breakdown (idempotent).
//       Preserves existing amountPaid/paymentStatus; recalculates equal shares.
// @route POST /api/splits/:id/ensure-members
// @access Public (called automatically from frontend on mount)
export const ensureSplitHasGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const split = await Split.findById(id).lean();
    if (!split) return sendResponse(res, 404, false, 'Split not found');

    // Find the group linked to this split
    const grp = await Group.findOne({ splitId: id }).populate('members', 'name fullName email');
    if (!grp || !grp.members || grp.members.length === 0) {
      return sendResponse(res, 404, false, 'No group members found to add');
    }

    const members = grp.members;
    const total = split.totalAmount || 0;
    const count = members.length;
    const perPerson = Math.round((total / count) * 100) / 100;
    const pct = Math.round((100 / count) * 100) / 100;

    // Rebuild breakdown: for existing members preserve payment state, for new members start fresh
    const existingMap = {};
    for (const b of split.breakdown || []) {
      const uid = String(b.user || b.participant || '');
      if (uid) existingMap[uid] = b;
    }

    const nextBreakdown = members.map((m) => {
      const uid = String(m._id);
      const existing = existingMap[uid];
      return {
        user: m._id,
        name: m.fullName || m.name || m.email || 'Participant',
        email: m.email || '',
        amount: perPerson,
        amountPaid: existing ? (existing.amountPaid || 0) : 0,
        paymentStatus: existing ? (existing.paymentStatus || 'unpaid') : 'unpaid',
        percentage: pct,
        items: existing ? (existing.items || []) : [],
      };
    });

    // Use atomic update to avoid optimistic-lock VersionError under concurrent requests.
    const updatedSplit = await Split.findByIdAndUpdate(
      id,
      {
        $set: {
          breakdown: nextBreakdown,
          status: SPLIT_STATUS.CALCULATED,
          calculatedAt: new Date(),
        },
      },
      { new: true }
    );

    const populated = await Split.findById(updatedSplit._id)
      .populate('receipt')
      .populate('breakdown.user', 'name email')
      .populate('breakdown.participant', 'name email');

    // Notify room so all open clients refetch
    try {
      const io = getIO();
      if (grp && grp._id) io.to(String(grp._id)).emit('split-updated', { splitId: updatedSplit._id });
    } catch (e) {}

    return sendResponse(res, 200, true, 'Split updated with group members', { split: populated });
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
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
      return sendResponse(res, 200, true, 'Split already finalized', { split });
    }

    // Update participant totals when participant refs exist.
    for (const item of split.breakdown) {
      if (!item?.participant) continue;
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
