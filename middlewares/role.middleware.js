import { ROLES } from '../config/constants.js';
import Participant from '../models/participant.model.js';
import { sendResponse } from '../utils/response.js';

export const requireHost = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const participant = await Participant.findOne({
      session: sessionId,
      user: req.user.id,
    });

    if (!participant || participant.role !== ROLES.HOST) {
      return sendResponse(res, 403, false, 'Host access required');
    }

    next();
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      return sendResponse(res, 403, false, 'Admin access required');
    }

    next();
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

export const requireParticipant = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const participant = await Participant.findOne({
      session: sessionId,
      user: req.user.id,
    });

    if (!participant) {
      return sendResponse(res, 403, false, 'Participant access required');
    }

    req.participant = participant;
    next();
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
