/**
 * @module ErrorHandler
 * @description Middleware for handling errors in Express applications.
 */

/**
 * @function errorHandler
 * @description Catches and handles errors, logging them and sending a standardized error response.
 * @param {Error} err - The error object thrown or passed to the middleware.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object used to send the error response.
 * @param {Function} next - Express next middleware function (not used in this case).
 * @returns {void} Sends a JSON response with a 500 status code and error message.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};