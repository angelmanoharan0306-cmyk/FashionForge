/**
 * FashionForge — Global Error Handler Middleware
 * Formats server exceptions into consistent JSON error responses.
 */

function errorHandler(err, req, res, next) {
  console.error('[FashionForge Server Error]:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(val => val.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'MongoDB schema validation failed',
      details: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Conflict Error',
      message: 'A design with this identifier already exists'
    });
  }

  // Bad JSON syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload in request body'
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
}

module.exports = errorHandler;
