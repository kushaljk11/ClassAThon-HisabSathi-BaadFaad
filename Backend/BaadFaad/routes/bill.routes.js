import express from 'express';
import billController from '../controllers/BillController.js';

const router = express.Router();

router.post('/parse', billController);

export default router;
