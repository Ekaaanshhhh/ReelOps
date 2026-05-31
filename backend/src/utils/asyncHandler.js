/**
 * Async Handler
 *
 * Wraps async route handlers to automatically catch errors
 * and pass them to the centralized error handler.
 * Eliminates repetitive try/catch in every controller.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
