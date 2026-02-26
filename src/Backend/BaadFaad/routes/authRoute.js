/**
 * @fileoverview Authentication Routes
 * @description Express router for user authentication endpoints.
 *              Supports email/password login and Google OAuth 2.0 flow.
 *
 * Routes:
 *  POST /login           - Email/password authentication
 *  GET  /google          - Initiates Google OAuth consent screen
 *  GET  /google/callback  - Handles Google OAuth callback, issues JWT & redirects to frontend
 *
 * @module routes/authRoute
 */
import express from "express";
import {getPassport} from "../config/passport.js";
import  {login}  from "../controllers/authController.js";


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
    res.redirect(
      `https://baadfaad.vercel.app/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
);

export default router;