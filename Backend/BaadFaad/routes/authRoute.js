import express from "express";
import { getPassport } from "../config/passport.js";
import { login } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);

/* Google OAuth */
router.get(
  "/google",
  (req, res, next) => {
    getPassport().authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  }
);

router.get(
  "/google/callback",
  (req, res, next) => {
    getPassport().authenticate("google", { session: false })(req, res, next);
  },
  (req, res) => {
    const { token, user } = req.user;
    const callbackUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(
      `${callbackUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
);

export default router;