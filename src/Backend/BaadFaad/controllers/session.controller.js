/**
 * @file controllers/session.controller.js
 * @description Session controller — CRUD + join logic for live split sessions.
 * Generates QR codes for easy participant onboarding and emits
 * real-time Socket.IO events when participants join.
 */
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

/**
 * Create a new session linked to a split. Generates a QR code and
 * auto-adds the creator as the first (host) participant.
 * @route POST /api/session
 * @param {import('express').Request} req - body: { name, splitId, userId? }
 * @param {import('express').Response} res
 */
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

/**
 * List all sessions ordered by creation date (newest first).
 * @route GET /api/session
 */
export const getAllSessions = async (_req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
};

/**
 * Fetch a single session by its MongoDB _id.
 * @route GET /api/session/:id
 */
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

/**
 * Fetch the session associated with a given splitId.
 * @route GET /api/session/split/:splitId
 */
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
    const dupFilters = [];

    if (userId) {
      participantEntry.user = userId;
      dupFilters.push({ "participants.user": userId });

      // Populate name/email from User model
      const userDoc = await User.findById(userId).select("name email");
      if (userDoc) {
        participantEntry.name = userDoc.name;
        participantEntry.email = userDoc.email;
      }
    } else if (participantId) {
      participantEntry.participant = participantId;
      dupFilters.push({ "participants.participant": participantId });
    } else if (name) {
      const Participant = (await import("../models/participant.model.js")).default;
      const newParticipant = await Participant.create({ name, email });
      participantEntry.participant = newParticipant._id;
      participantEntry.name = newParticipant.name;
      participantEntry.email = newParticipant.email;
    } else {
      return res.status(400).json({ message: "userId, participantId, or name is required" });
    }

    // Atomic push — only add if not already a participant
    const norClause = dupFilters.length > 0 ? { $nor: dupFilters } : {};
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId, ...norClause },
      { $push: { participants: participantEntry } },
      { new: true }
    )
      .populate("participants.user", "name email")
      .populate("participants.participant", "name email");

    if (!updatedSession) {
      // Either session not found or duplicate — return current session
      const current = await Session.findById(sessionId)
        .populate("participants.user", "name email")
        .populate("participants.participant", "name email");
      return res.status(200).json({
        message: "Already joined this session",
        session: current,
      });
    }

    // Flatten participant names for socket payload
    const flatParticipants = updatedSession.participants.map((p) => ({
      _id: p._id,
      name: p.name || p.user?.name || p.participant?.name || "Anonymous",
      email: p.email || p.user?.email || p.participant?.email || "",
      joinedAt: p.joinedAt,
    }));

    // Emit real-time update to everyone in the session room
    try {
      getIO().to(sessionId).emit("participant-joined", {
        participants: flatParticipants,
        newParticipant: flatParticipants[flatParticipants.length - 1],
      });
    } catch {}

    return res.status(200).json({
      message: "Joined session successfully",
      session: updatedSession,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to join session", error: error.message });
  }
};