import express from 'express';
import {
  createSplit,
  getAllSplits,
  getSplitById,
  updateSplit,
  updateParticipantPayment,
  finalizeSplit,
  deleteSplit,
} from '../controllers/split.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', createSplit);
router.get('/', protect, getAllSplits);
router.get('/:id', getSplitById);
router.put('/:id', updateSplit);
router.put('/:id/participant/:participantIndex', updateParticipantPayment);
router.post('/:id/finalize', protect, finalizeSplit);
router.delete('/:id', protect, deleteSplit);

export default router;
