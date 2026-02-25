import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT tokens.
 * Attaches decoded user info to req.user.
 * For this prototype the middleware is lenient – if no JWT_SECRET is set it
 * falls through so that routes remain testable without auth.
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
