import Payment from '../models/payment.model.js';
import Settlement from '../models/settlement.model.js';
import { sendResponse } from '../utils/response.js';
import { PAYMENT_STATUS, SETTLEMENT_STATUS } from '../config/constants.js';

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { settlementId, amount, method, transactionId, screenshot, notes } = req.body;
    const fromUserId = req.user.id;

    // Get settlement
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return sendResponse(res, 404, false, 'Settlement not found');
    }

    // Check if user is the payer
    if (settlement.from.toString() !== fromUserId) {
      return sendResponse(res, 403, false, 'Not authorized to make this payment');
    }

    // Create payment
    const payment = await Payment.create({
      settlement: settlementId,
      from: fromUserId,
      to: settlement.to,
      amount,
      method,
      transactionId,
      screenshot,
      notes,
      status: PAYMENT_STATUS.COMPLETED,
      completedAt: new Date(),
    });

    // Update settlement
    settlement.payment = payment._id;
    settlement.status = SETTLEMENT_STATUS.PAID;
    settlement.paidAt = new Date();
    await settlement.save();

    await payment.populate('from', 'name email avatar');
    await payment.populate('to', 'name email avatar');

    sendResponse(res, 201, true, 'Payment recorded successfully', { payment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('from', 'name email avatar phone')
      .populate('to', 'name email avatar phone')
      .populate('settlement');

    if (!payment) {
      return sendResponse(res, 404, false, 'Payment not found');
    }

    sendResponse(res, 200, true, 'Payment fetched successfully', { payment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get payments for a user
// @route   GET /api/payments/user/:userId
// @access  Private
export const getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const payments = await Payment.find({
      $or: [{ from: userId }, { to: userId }],
    })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('settlement')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Payments fetched successfully', { payments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get payments for a settlement
// @route   GET /api/payments/settlement/:settlementId
// @access  Private
export const getSettlementPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ settlement: req.params.settlementId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Payments fetched successfully', { payments });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update payment status
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
  try {
    const { status, failureReason, notes } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return sendResponse(res, 404, false, 'Payment not found');
    }

    if (status) {
      payment.status = status;
      if (status === PAYMENT_STATUS.COMPLETED) {
        payment.completedAt = new Date();
      }
    }
    if (failureReason) payment.failureReason = failureReason;
    if (notes) payment.notes = notes;

    const updatedPayment = await payment.save();

    sendResponse(res, 200, true, 'Payment updated successfully', { payment: updatedPayment });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
