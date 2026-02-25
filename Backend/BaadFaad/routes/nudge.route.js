import express from "express";
import {
  createAndSendNudge,
  sendSplitSummary,
  getAllNudges,
  getNudgeById,
  updateNudgeStatus,
} from "../controllers/nudge.controller.js";

const router = express.Router();

router.post("/send", createAndSendNudge);
router.post("/split-summary", sendSplitSummary);
router.get("/", getAllNudges);
router.get("/:id", getNudgeById);
router.patch("/:id/status", updateNudgeStatus);

export default router;
