import express from "express";
import {
  initiatePayment,
  paymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate-payment", initiatePayment);

router.post("/payment-status", paymentStatus);

export default router;