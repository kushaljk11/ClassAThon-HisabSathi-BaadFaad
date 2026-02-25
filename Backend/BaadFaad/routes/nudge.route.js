import express from "express";
import {
  createAndSendNudge,
  getAllNudges,
  getNudgeById,
  updateNudgeStatus,
} from "../controllers/nudge.controller.js";

const router = express.Router();

router.post("/send", createAndSendNudge);
router.get("/", getAllNudges);
router.get("/:id", getNudgeById);
router.patch("/:id/status", updateNudgeStatus);

export default router;
