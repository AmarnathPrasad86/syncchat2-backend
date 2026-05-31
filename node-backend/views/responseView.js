const success = (res, statusCode, payload) => {
  return res.status(statusCode).json(payload);
};

const error = (res, statusCode, payload) => {
  const response = typeof payload === 'string' ? { error: payload } : payload;
  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  error,
};
