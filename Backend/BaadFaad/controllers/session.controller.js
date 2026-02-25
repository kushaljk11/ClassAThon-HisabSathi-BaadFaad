import QRCode from 'qrcode';
import Session from "../models/session.model.js";

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
    console.log("=== CREATE SESSION REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { name, splitId } = req.body;

    if (!name || !splitId) {
      console.log("Missing required fields:", { name, splitId });
      return res.status(400).json({ message: "name and splitId are required" });
    }

    console.log("Checking for existing session with splitId:", splitId);
    // Check if a session already exists for this splitId
    const existingSession = await Session.findOne({ splitId });
    if (existingSession) {
      console.log("Found existing session:", existingSession._id);
      return res.status(200).json({ 
        message: "Session already exists for this split", 
        session: existingSession 
      });
    }

    console.log("Creating new session...");
    // Create session first to get the ID
    const session = await Session.create({ name, splitId });
    console.log("Session created with ID:", session._id);
    
    // Generate QR code with session join URL
    const joinUrl = `${QR_BASE_URL}/split/ready?splitId=${splitId}&sessionId=${session._id}&type=session`;
    console.log("Generating QR code for URL:", joinUrl);
    const qrCodeBase64 = await generateQRCode(joinUrl);
    
    // Update session with QR code
    session.qrCode = qrCodeBase64;
    await session.save();
    console.log("Session updated with QR code");
    
    return res.status(201).json({ message: "Session created with QR code", session });
  } catch (error) {
    console.error("=== SESSION CREATION ERROR ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
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
    console.log("=== GET SESSION BY ID ===");
    console.log("Session ID:", req.params.id);
    
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    console.log("Session found:", session._id);
    console.log("Participants count:", session.participants.length);
    
    // Return session with participant name/email stored directly
    const sessionObj = session.toObject();
    console.log("Participants:", JSON.stringify(sessionObj.participants, null, 2));

    return res.status(200).json(sessionObj);
  } catch (error) {
    console.error("GET SESSION ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch session", error: error.message });
  }
};

export const getSessionBySplitId = async (req, res) => {
  try {
    const session = await Session.findOne({ splitId: req.params.splitId });

    if (!session) {
      return res.status(404).json({ message: "Session not found for this split" });
    }
    
    // Return session with participant name/email stored directly
    const sessionObj = session.toObject();

    return res.status(200).json(sessionObj);
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

    console.log("=== JOIN SESSION REQUEST ===");
    console.log("Session ID:", sessionId);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if session has expired
    if (session.endDate && new Date() > session.endDate) {
      return res.status(400).json({ message: "Session has expired" });
    }

    // Check if participant already joined
    const alreadyJoined = session.participants.some(
      (p) =>
        (userId && p.user?.toString() === userId) ||
        (participantId && p.participant?.toString() === participantId)
    );

    if (alreadyJoined) {
      return res.status(200).json({
        message: "Already joined session",
        session,
      });
    }

    // Add participant to session
    const participantEntry = {
      joinedAt: new Date(),
    };

    if (userId) {
      console.log("Adding user to session:", userId);
      // Fetch user details from User model
      const { User } = await import("../models/userModel.js");
      const user = await User.findById(userId).select("name email");
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Fetched user details:", user.name, user.email);
      participantEntry.user = userId;
      participantEntry.name = user.name;
      participantEntry.email = user.email;
    } else if (participantId) {
      console.log("Adding participant to session:", participantId);
      participantEntry.participant = participantId;
    } else if (name) {
      // Create anonymous participant
      const Participant = (await import("../models/participant.model.js")).default;
      const newParticipant = await Participant.create({ name, email });
      console.log("Created anonymous participant:", newParticipant._id);
      participantEntry.participant = newParticipant._id;
    } else {
      return res.status(400).json({ message: "userId, participantId, or name is required" });
    }

    console.log("Participant entry to be added:", participantEntry);
    session.participants.push(participantEntry);
    await session.save();
    console.log("Session saved, participants count:", session.participants.length);
    console.log("Participant joined successfully");

    return res.status(200).json({
      message: "Joined session successfully",
      session: session.toObject(),
    });
  } catch (error) {
    console.error("=== JOIN SESSION ERROR ===");
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Failed to join session", error: error.message });
  }
};
