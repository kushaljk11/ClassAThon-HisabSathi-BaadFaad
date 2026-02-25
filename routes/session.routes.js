import express from 'express';
import {
  createSession,
  getSessionByCode,
  getSessionById,
  getUserSessions,
  updateSession,
  deleteSession,
} from '../controllers/session.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createSession);
router.get('/code/:code', getSessionByCode);
router.get('/user/:userId', protect, getUserSessions);
router.get('/:id', protect, getSessionById);
router.put('/:id', protect, updateSession);
router.delete('/:id', protect, deleteSession);

export default router;
