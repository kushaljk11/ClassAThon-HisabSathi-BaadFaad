import express from 'express';
import {
  createSplit,
  getAllSplits,
  getSplitById,
  updateSplit,
  finalizeSplit,
  deleteSplit,
} from '../controllers/split.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', createSplit); // Temporarily removed protect middleware for testing
router.get('/', protect, getAllSplits);
router.get('/:id', getSplitById); // Removed protect for testing
router.put('/:id', updateSplit); // Removed protect for testing
router.post('/:id/finalize', protect, finalizeSplit);
router.delete('/:id', protect, deleteSplit);

export default router;
