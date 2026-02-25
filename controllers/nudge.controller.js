import Nudge from '../models/nudge.model.js';
import Settlement from '../models/settlement.model.js';
import { sendResponse } from '../utils/response.js';
import { sendEmail } from '../config/mail.js';
import { getNudgeTemplate } from '../templates/nudge.template.js';
import { NUDGE_TYPE } from '../config/constants.js';

// @desc    Send a nudge
// @route   POST /api/nudges
// @access  Private
export const sendNudge = async (req, res) => {
  try {
    const { settlementId, message, type } = req.body;
    const fromUserId = req.user.id;

    // Get settlement
    const settlement = await Settlement.findById(settlementId)
      .populate('from', 'name email')
      .populate('to', 'name email');

    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    // Check if user is the one receiving payment
    if (settlement.to._id.toString() !== fromUserId) {
      return sendResponse(res, 403, false, 'Only the receiver can send nudges');
    }

    // Create nudge
    const nudge = await Nudge.create({
      session: settlement.session,
      settlement: settlementId,
      from: fromUserId,
      to: settlement.from._id,
      type: type || NUDGE_TYPE.REMINDER,
      message: message || `Reminder: You have a pending payment of Rs. ${settlement.amount}`,
      amount: settlement.amount,
    });

    // Send email notification
    try {
      const emailHtml = getNudgeTemplate({
        toName: settlement.from.name,
        fromName: settlement.to.name,
        amount: settlement.amount,
        message: nudge.message,
        type: nudge.type,
      });

      await sendEmail({
        to: settlement.from.email,
        subject: 'Payment Reminder - BaadFaad',
        html: emailHtml,
      });

      nudge.isSent = true;
      nudge.sentAt = new Date();
      await nudge.save();
    } catch (emailError) {
      console.error('Email send failed:', emailError);
    }

    await nudge.populate('from', 'name email avatar');
    await nudge.populate('to', 'name email avatar');

    sendResponse(res, 201, true, 'Nudge sent successfully', { nudge });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get nudges for a user
// @route   GET /api/nudges/user/:userId
// @access  Private
export const getUserNudges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const nudges = await Nudge.find({ to: userId })
      .populate('from', 'name email avatar')
      .populate('settlement')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Nudges fetched successfully', { nudges });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Mark nudge as read
// @route   PUT /api/nudges/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const nudge = await Nudge.findById(req.params.id);
    if (!nudge) {
      return sendResponse(res, 404, false, 'Nudge not found');
    }

    // Check if user is the recipient
    if (nudge.to.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Not authorized');
    }

    nudge.isRead = true;
    nudge.readAt = new Date();
    await nudge.save();

    sendResponse(res, 200, true, 'Nudge marked as read', { nudge });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get nudges for a settlement
// @route   GET /api/nudges/settlement/:settlementId
// @access  Private
export const getSettlementNudges = async (req, res) => {
  try {
    const nudges = await Nudge.find({ settlement: req.params.settlementId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Nudges fetched successfully', { nudges });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
