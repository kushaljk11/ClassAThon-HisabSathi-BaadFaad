import Participant from '../models/participant.model.js';
import Session from '../models/session.model.js';
import { sendResponse } from '../utils/response.js';
import { PARTICIPANT_STATUS, ROLES } from '../config/constants.js';

// @desc    Join a session
// @route   POST /api/participants/join
// @access  Private
export const joinSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const userId = req.user.id;

    // Find session
    const session = await Session.findOne({ sessionCode });
    if (!session) {
      return sendResponse(res, 404, false, 'Session not found');
    }

    // Check if user already in session
    const existingParticipant = await Participant.findOne({
      session: session._id,
      user: userId,
    });

    if (existingParticipant) {
      return sendResponse(res, 400, false, 'Already joined this session');
    }

    // Create participant
    const participant = await Participant.create({
      session: session._id,
      user: userId,
      role: ROLES.PARTICIPANT,
      status: PARTICIPANT_STATUS.JOINED,
      joinedAt: new Date(),
    });

    // Add to session
    session.participants.push(participant._id);
    await session.save();

    await participant.populate('user', 'name email avatar');

    sendResponse(res, 201, true, 'Joined session successfully', { participant });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get participants of a session
// @route   GET /api/participants/session/:sessionId
// @access  Private
export const getSessionParticipants = async (req, res) => {
  try {
    const participants = await Participant.find({ session: req.params.sessionId })
      .populate('user', 'name email avatar phone upiId')
      .populate('session', 'title sessionCode');

    sendResponse(res, 200, true, 'Participants fetched successfully', { participants });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update participant status
// @route   PUT /api/participants/:id
// @access  Private
export const updateParticipant = async (req, res) => {
  try {
    const { status, totalOwed, totalPaid, isSettled } = req.body;

    const participant = await Participant.findById(req.params.id);
    if (!participant) {
      return sendResponse(res, 404, false, 'Participant not found');
    }

    if (status) participant.status = status;
    if (totalOwed !== undefined) participant.totalOwed = totalOwed;
    if (totalPaid !== undefined) participant.totalPaid = totalPaid;
    if (isSettled !== undefined) participant.isSettled = isSettled;

    const updatedParticipant = await participant.save();

    sendResponse(res, 200, true, 'Participant updated successfully', { participant: updatedParticipant });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Remove participant from session
// @route   DELETE /api/participants/:id
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const participant = await Participant.findById(req.params.id).populate('session');
    if (!participant) {
      return sendResponse(res, 404, false, 'Participant not found');
    }

    // Check if user is host or the participant themselves
    if (
      participant.session.host.toString() !== req.user.id &&
      participant.user.toString() !== req.user.id
    ) {
      return sendResponse(res, 403, false, 'Not authorized');
    }

    // Remove from session
    await Session.findByIdAndUpdate(participant.session._id, {
      $pull: { participants: participant._id },
    });

    await participant.deleteOne();
    sendResponse(res, 200, true, 'Participant removed successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
