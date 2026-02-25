/**
 * @fileoverview Authentication Middleware (lenient / dev-friendly)
 * @description JWT verification middleware for protected routes.
 *              In development mode, requests without a token are allowed through
 *              so that routes remain testable without full auth setup.
 *              In production, a valid Bearer token is strictly required.
 *
 * @module middlewares/auth.middleware
 */
import jwt from 'jsonwebtoken';

/**
 * Verify JWT token and attach decoded user info to the request.
 * In development/prototype mode the middleware is lenient — if no token
 * is provided it falls through so routes remain testable without auth.
 *
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development / prototype mode, allow requests without a token
      if (process.env.NODE_ENV !== 'production') {
        return next();
      }
      return res.status(401).json({ success: false, message: 'Access denied' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'baadfaad-dev-secret';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid access token' });
  }
};
