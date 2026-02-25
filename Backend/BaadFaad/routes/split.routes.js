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

router.post('/', protect, createSplit);
router.get('/', protect, getAllSplits);
router.get('/:id', protect, getSplitById);
router.put('/:id', protect, updateSplit);
router.post('/:id/finalize', protect, finalizeSplit);
router.delete('/:id', protect, deleteSplit);

export default router;
