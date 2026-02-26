/**
 * @file utils/response.js
 * @description Standardized API response helper for consistent JSON output.
 */

/**
 * Send a uniform JSON response.
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP status
 * @param {boolean} success - operation succeeded?
 * @param {string} message - human-readable message
 * @param {object|null} [data] - optional payload merged into response
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) {
    Object.assign(response, data);
  }
  return res.status(statusCode).json(response);
};
