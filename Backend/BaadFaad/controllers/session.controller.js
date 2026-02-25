import Session from '../models/session.model.js';
import Participant from '../models/participant.model.js';
import QRCode from 'qrcode';

const QR_BASE_URL = process.env.QR_BASE_URL || 'http://localhost:5173';

// @desc    Create a new session (split session / lobby)
// @route   POST /api/sessions
export const createSession = async (req, res) => {
  try {
    const { name, hostName, hostEmail, groupId } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Session name is required' });
    }

    // Create the session
    const session = await Session.create({
      name,
      group: groupId || undefined,
    });

    // Create the host participant
    const host = await Participant.create({
      name: hostName || 'Host',
      email: hostEmail || '',
      session: session._id,
      isHost: true,
    });

    session.host = host._id;
    session.participants.push(host._id);

    // Generate QR code
    const joinUrl = `${QR_BASE_URL}/split/join/${session._id}`;
    session.qrCode = await QRCode.toDataURL(joinUrl, { width: 300, margin: 2 });

    await session.save();

    const populated = await Session.findById(session._id)
      .populate('participants')
      .populate('host');

    res.status(201).json({ success: true, message: 'Session created', session: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('participants')
      .populate('host');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a session (add participant)
// @route   POST /api/sessions/:id/join
export const joinSession = async (req, res) => {
  try {
    const { name, email } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'finalized') {
      return res.status(400).json({ success: false, message: 'Session already finalized' });
    }

    const participant = await Participant.create({
      name: name || 'Guest',
      email: email || '',
      session: session._id,
      isHost: false,
    });

    session.participants.push(participant._id);
    await session.save();

    const populated = await Session.findById(session._id)
      .populate('participants')
      .populate('host');

    res.status(201).json({ success: true, message: 'Joined session', session: populated, participant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status
// @route   PATCH /api/sessions/:id/status
export const updateSessionStatus = async (req, res) => {
  try {
    const { status, totalAmount } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (status) session.status = status;
    if (totalAmount !== undefined) session.totalAmount = totalAmount;
    await session.save();

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sessions (for dashboard)
// @route   GET /api/sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('participants')
      .populate('host')
      .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
