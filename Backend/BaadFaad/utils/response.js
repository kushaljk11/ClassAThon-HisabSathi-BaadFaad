/**
 * Standardized API response helper
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data) {
    Object.assign(response, data);
  }
  return res.status(statusCode).json(response);
};
