import Session from "../models/session.model.js";

export const createSession = async (req, res) => {
  try {
    const { name, splitId } = req.body;

    if (!name || !splitId) {
      return res.status(400).json({ message: "name and splitId are required" });
    }

    const session = await Session.create({ name, splitId });
    return res.status(201).json({ message: "Session created", session });
  } catch (error) {
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
    const session = await Session.findOne({ splitId: req.params.splitId });

    if (!session) {
      return res.status(404).json({ message: "Session not found for this split" });
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch session", error: error.message });
  }
};
