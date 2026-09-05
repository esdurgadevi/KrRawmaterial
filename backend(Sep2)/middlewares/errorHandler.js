// middlewares/errorHandler.js
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = 'Something went wrong' } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;