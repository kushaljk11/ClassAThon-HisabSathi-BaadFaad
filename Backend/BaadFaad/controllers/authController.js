/**
 * @file controllers/authController.js
 * @description Authentication controller — handles email/password login.
 * Google OAuth is handled separately via Passport in the auth route.
 */
import bcrypt from 'bcryptjs';
import {User} from '../models/userModel.js';
import { generateToken } from '../utils/generateToken.js';


/**
 * Authenticate a user with email & password.
 * @route POST /api/auth/login
 * @param {import('express').Request} req - body: { email, password }
 * @param {import('express').Response} res - JWT token + user object on success
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ message: "User does not exist" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(400).json({ message: "Incorrect password" });

  const token = generateToken(user);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};