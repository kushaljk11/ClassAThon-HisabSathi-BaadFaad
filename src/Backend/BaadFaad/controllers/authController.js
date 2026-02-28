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

/**
 * Continue with name-only or email (dev-friendly flow).
 * If `email` is provided, will find or create a user by email.
 * If no email is provided, creates a guest user with a generated local email.
 * @route POST /api/auth/continue
 */
export const continueAuth = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    let user = null;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name: fullName.trim(), email });
      }
    } else {
      // Create a guest user record with generated local email to satisfy unique constraint
      const guestEmail = `guest-${Date.now()}-${Math.random().toString(36).slice(2,8)}@local`;
      user = await User.create({ name: fullName.trim(), email: guestEmail });
    }

    const token = generateToken(user);

    return res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('continueAuth error:', error);
    return res.status(500).json({ message: 'Failed to continue', error: error.message });
  }
};