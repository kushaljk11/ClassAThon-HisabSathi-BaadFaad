export const sendResponse = (res, statusCode, success, message, data = null, extra = {}) => {
  const response = {
    success,
    message,
    ...extra,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
