/**
 * FashionForge — Auth Controller
 * Handles user registration, authentication, JWT issuing, and profile inspection.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../middleware/auth');

/**
 * Signs a JWT for a user
 */
function createToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name
    },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
}

/**
 * POST /api/auth/register
 * Registers a new user account
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required.'
      });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'A valid email address is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        error: 'Conflict Error',
        message: 'An account with this email address already exists.'
      });
    }

    // Securely hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const savedUser = await newUser.save();
    const token = createToken(savedUser);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: savedUser.toJSON()
    });
  } catch (error) {
    console.error('[Auth Controller] register error:', error.message);
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns JWT
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Both email and password are required.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password.'
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('[Auth Controller] login error:', error.message);
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieves profile of currently authenticated user
 */
async function getMe(req, res) {
  // req.user is guaranteed by requireAuth middleware
  return res.status(200).json({
    success: true,
    user: {
      userId: req.user.userId,
      name: req.user.name,
      email: req.user.email
    }
  });
}

module.exports = {
  register,
  login,
  getMe
};
