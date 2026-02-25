/**
 * @fileoverview Authentication Middleware (strict)
 * @description Strict JWT verification middleware. Requires a valid Bearer token
 *              in the Authorization header. Returns 401 for missing or invalid tokens.
 *              Attaches the decoded user payload to `req.user` on success.
 *
 * @module middleware/middleWare
 */
import jwt from "jsonwebtoken";

/**
 * Verify JWT token and attach decoded user info to the request.
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Next middleware function
 */
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // user info attached
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid" });
  }
};