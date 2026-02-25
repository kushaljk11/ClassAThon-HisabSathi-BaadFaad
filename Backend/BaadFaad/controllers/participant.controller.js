import Participant from '../models/participant.model.js';

// create new participant record
export const createParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.create(req.body);
    res.status(201).json(participant);
  } catch (err) {
    next(err);
  }
};

// fetch list of participants
export const getParticipants = async (req, res, next) => {
  try {
    const participants = await Participant.find();
    res.json(participants);
  } catch (err) {
    next(err);
  }
};

// get a single participant by id
export const getParticipantById = async (req, res, next) => {
  try {
    const participant = await Participant.findById(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json(participant);
  } catch (err) {
    next(err);
  }
};

// update participant details
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

// remove a participant
export const deleteParticipant = async (req, res, next) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });
    res.json({ message: 'Participant deleted' });
  } catch (err) {
    next(err);
  }
};
