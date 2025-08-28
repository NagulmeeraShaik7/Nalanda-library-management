/**
 * @module AuthMiddleware
 * @description Middleware functions for authentication and authorization in Express applications.
 */

import jwt from "jsonwebtoken";

/**
 * @function authenticate
 * @description Middleware to authenticate requests by verifying JWT tokens.
 * @param {Object} req - Express request object, expects an Authorization header with a Bearer token.
 * @param {Object} res - Express response object used to send the response.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Calls the next middleware if authentication succeeds, otherwise responds with a 401 status.
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

/**
 * @function authorize
 * @description Middleware to authorize requests based on user roles.
 * @param {string[]} [roles=[]] - Array of roles allowed to access the route.
 * @returns {Function} Express middleware function that checks if the user's role is included in the allowed roles.
 * @param {Object} req - Express request object containing the user object from authentication.
 * @param {Object} res - Express response object used to send the response.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Calls the next middleware if authorization succeeds, otherwise responds with a 403 status.
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};