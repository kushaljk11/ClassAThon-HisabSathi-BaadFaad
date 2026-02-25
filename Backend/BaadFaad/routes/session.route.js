import express from "express";
import {
  createSession,
  getAllSessions,
  getSessionById,
  getSessionBySplitId,
  joinSession,
} from "../controllers/session.controller.js";

const router = express.Router();

router.post("/", createSession);
router.post("/join/:sessionId", joinSession);
router.get("/", getAllSessions);
router.get("/split/:splitId", getSessionBySplitId);
router.get("/:id", getSessionById);

export default router;
