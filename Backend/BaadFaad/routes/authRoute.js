import express from "express";
import {passportUse} from "../config/passport.js";
import  {login}  from "../controllers/authController.js";


const router = express.Router();

router.post("/login", login);

/* Google OAuth */
router.get(
  "/google",
  passportUse.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passportUse.authenticate("google", { session: false }),
  (req, res) => {
    const { token, user } = req.user;
    res.redirect(
      `http://localhost:5173/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
);

export default router;