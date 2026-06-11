// ── errorMiddleware.js ─────────────────────────────────────────
const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log server errors
  if (status >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${status}: ${message}`);
    if (process.env.NODE_ENV === 'development') logger.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
