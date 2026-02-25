import express from 'express';
import {
  createSession,
  getSessionById,
  joinSession,
  updateSessionStatus,
  getSessions,
} from '../controllers/session.controller.js';

const router = express.Router();

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.post('/:id/join', joinSession);
router.patch('/:id/status', updateSessionStatus);

export default router;
