const ApiError = require('../utils/ApiError');

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined
    });
  }

  // MySQL duplicate entry, etc. - keep generic to avoid leaking internals
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`
  });
}

module.exports = { errorHandler, notFoundHandler };
