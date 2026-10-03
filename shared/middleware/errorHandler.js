/**
 * Common Express error handler middleware
 */
function errorHandler(serviceName = 'service') {
  return (err, req, res, _next) => {
    console.error(`[${serviceName}] Error on ${req.method} ${req.originalUrl}:`, err);
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected internal error occurred'
      : err.message || 'Internal server error';

    res.status(status).json({
      error: message,
      service: serviceName,
      status,
      timestamp: new Date().toISOString(),
    });
  };
}

module.exports = { errorHandler };
