import Session from '../models/session.model.js';
import Participant from '../models/participant.model.js';
import { sendResponse } from '../utils/response.js';
import { generateQRCode } from '../utils/qrGenerator.js';
import { SESSION_STATUS, ROLES, PARTICIPANT_STATUS } from '../config/constants.js';

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
export const createSession = async (req, res) => {
  try {
    const { title, description, currency } = req.body;
    const hostId = req.user.id;

    // Generate unique session code
    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Generate QR code
    const qrCode = await generateQRCode(sessionCode);

    // Create session
    const session = await Session.create({
      title,
      description,
      host: hostId,
      sessionCode,
      qrCode,
      currency: currency || 'NPR',
    });

    // Add host as participant
    const hostParticipant = await Participant.create({
      session: session._id,
      user: hostId,
      role: ROLES.HOST,
      status: PARTICIPANT_STATUS.JOINED,
      joinedAt: new Date(),
    });

    session.participants.push(hostParticipant._id);
    await session.save();

    sendResponse(res, 201, true, 'Session created successfully', { session });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get session by code
// @route   GET /api/sessions/code/:code
// @access  Public
export const getSessionByCode = async (req, res) => {
  try {
    const session = await Session.findOne({ sessionCode: req.params.code })
      .populate('host', 'name email avatar')
      .populate({
        path: 'participants',
        populate: { path: 'user', select: 'name email avatar' },
      });

    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    sendResponse(res, 200, true, 'Session fetched successfully', { session });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host', 'name email avatar')
      .populate({
        path: 'participants',
        populate: { path: 'user', select: 'name email avatar' },
      })
      .populate('receipts');

    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    sendResponse(res, 200, true, 'Session fetched successfully', { session });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all sessions for user
// @route   GET /api/sessions/user/:userId
// @access  Private
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    // Find all participants where user is involved
    const participants = await Participant.find({ user: userId })
      .populate({
        path: 'session',
        populate: { path: 'host', select: 'name email avatar' },
      });

    const sessions = participants.map(p => p.session);

    sendResponse(res, 200, true, 'Sessions fetched successfully', { sessions });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSession = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    // Check if user is host
    if (session.host.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Only host can update session');
    }

    if (title) session.title = title;
    if (description) session.description = description;
    if (status) session.status = status;

    const updatedSession = await session.save();

    sendResponse(res, 200, true, 'Session updated successfully', { session: updatedSession });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete session
// @route   DELETE /api/sessions/:id
// @access  Private
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    // Check if user is host
    if (session.host.toString() !== req.user.id) {
      return sendResponse(res, 403, false, 'Only host can delete session');
    }

    await session.deleteOne();
    sendResponse(res, 200, true, 'Session deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
