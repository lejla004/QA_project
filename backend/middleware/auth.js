const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/**
 * Requires a valid JWT in the Authorization header: "Bearer <token>".
 * Attaches the decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}

/**
 * Requires the authenticated user to have the 'admin' role.
 * Must be used AFTER requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required.'));
  }
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin privileges are required for this action.'));
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
