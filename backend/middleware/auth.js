/**
 * FashionForge — Authentication Middleware
 * Validates JSON Web Tokens from Authorization header and sets req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => process.env.JWT_SECRET || 'fashionforge_super_secure_atelier_secret_key_2026';

/**
 * Protects endpoints requiring a valid authenticated session
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token structure.'
      });
    }

    // Verify user exists in database
    const user = await User.findOne({ userId: decoded.userId });
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'The account associated with this token no longer exists.'
      });
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      name: user.name
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication session expired. Please log in again.'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or malformed authentication token.'
    });
  }
}

module.exports = {
  requireAuth,
  getJwtSecret
};
