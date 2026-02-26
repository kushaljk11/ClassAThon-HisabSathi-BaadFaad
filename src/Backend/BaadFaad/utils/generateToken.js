/**
 * @file utils/generateToken.js
 * @description JWT token generator. Creates a signed 30-day token
 * containing the user’s _id and name.
 */
import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for the given user.
 * @param {{ _id: string, name: string }} user
 * @returns {string} signed JWT
 * @throws {Error} if JWT_SECRET env var is missing
 */
export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      id: user._id,
      name: user.name,
    },
    secret,
    { expiresIn: '30d' }
  );
};