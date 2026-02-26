/**
 * @file controllers/participant.controller.js
 * @description Participant CRUD controller — manages individual participant
 * records (create, list, get, update, delete).
 */
import Participant from '../models/participant.model.js';

/**
 * Create a new participant record.
 * @route POST /api/participants
 */
export const createParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.create(req.body);
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
};

/**
 * List all participants.
 * @route GET /api/participants
 */
export const getParticipants = async (req, res, next) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single participant by MongoDB _id.
 * @route GET /api/participants/:id
 */
export const getParticipantById = async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json(participant);
  } catch (err) { 
    next(err);
  }
};

/**
 * Update participant details (name, email, etc.).
 * @route PUT /api/participants/:id
 */
export const updateParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json(participant);
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a participant record.
 * @route DELETE /api/participants/:id
 */
export const deleteParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json({ message: 'Participant deleted' });
  } catch (err) {
    next(err);
  }
};
