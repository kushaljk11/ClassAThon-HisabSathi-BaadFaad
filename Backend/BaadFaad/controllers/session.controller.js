import QRCode from 'qrcode';
import Session from "../models/session.model.js";
import { User } from "../models/userModel.js";
import { getIO } from "../config/socket.js";

const QR_BASE_URL = process.env.QR_BASE_URL || 'http://localhost:5173';

/**
 * Generates a QR code as Base64 data URL.
 * @param {string} data - URL or text to encode in QR
 * @returns {Promise<string>} Base64 QR code string
 */
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      width: 300,
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

export const createSession = async (req, res) => {
  try {
    const { name, splitId } = req.body;

    if (!name || !splitId) {
      return res.status(400).json({ message: "name and splitId are required" });
    }

    const existingSession = await Session.findOne({ splitId });
    if (existingSession) {
      return res.status(200).json({
        message: "Session already exists for this split",
        session: existingSession,
      });
    }

    const session = await Session.create({ name, splitId });

    const joinUrl = `${QR_BASE_URL}/split/ready?splitId=${splitId}&sessionId=${session._id}&type=session`;
    const qrCodeBase64 = await generateQRCode(joinUrl);

    session.qrCode = qrCodeBase64;

    // Auto-add the creator as the first participant (host)
    if (req.body.userId) {
      const hostUser = await User.findById(req.body.userId).select("name email");
      if (hostUser) {
        session.participants.push({
          user: hostUser._id,
          name: hostUser.name,
          email: hostUser.email,
          joinedAt: new Date(),
        });
      }
    }

    await session.save();

    return res.status(201).json({ message: "Session created with QR code", session });
  } catch (error) {
    console.error("Failed to create session:", error.message);
    return res.status(500).json({ message: "Failed to create session", error: error.message });
  }
};

export const getAllSessions = async (_req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch session", error: error.message });
  }
};

export const getSessionBySplitId = async (req, res) => {
  try {
    const session = await Session.findOne({ splitId: req.params.splitId })
      .populate("participants.user", "name email")
      .populate("participants.participant", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found for this split" });
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch session", error: error.message });
  }
};

/**
 * Join a session - for participants scanning QR code
 * POST /api/session/:sessionId/join
 * Body: { userId?, participantId?, name?, email? }
 */
export const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, participantId, name, email } = req.body;

    // Validate session exists and hasn't expired
    const sessionCheck = await Session.findById(sessionId);
    if (!sessionCheck) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (sessionCheck.endDate && new Date() > sessionCheck.endDate) {
      return res.status(400).json({ message: "Session has expired" });
    }

    // Build the participant entry and a duplicate-match filter
    const participantEntry = { joinedAt: new Date() };
    const dupFilters = [];  // conditions that mean "already joined"

    if (userId) {
      participantEntry.user = userId;
    } else if (participantId) {
      console.log("Adding participant to session:", participantId);
      participantEntry.participant = participantId;
      dupFilters.push({ "participants.participant": participantId });
    } else if (name) {
      const Participant = (await import("../models/participant.model.js")).default;
      const newParticipant = await Participant.create({ name, email });
      console.log("Created anonymous participant:", newParticipant._id);
      participantEntry.participant = newParticipant._id;
      participantEntry.name = newParticipant.name;
      participantEntry.email = newParticipant.email;
      // New participant, no duplicate possible
    } else {
      return res.status(400).json({ message: "userId, participantId, or name is required" });
    }

    session.participants.push(participantEntry);
    await session.save();

    await session.populate([
      { path: "participants.user", select: "name email" },
      { path: "participants.participant", select: "name email" },
    ]);

    console.log("Participant joined successfully");
    return res.status(200).json({
      message: "Joined session successfully",
      session,
    });
  } catch (error) {
    console.error("Failed to join session:", error.message);
    return res.status(500).json({ message: "Failed to join session", error: error.message });
  }
};