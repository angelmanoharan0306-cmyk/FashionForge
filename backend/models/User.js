/**
 * FashionForge — User Mongoose Model
 * Represents authenticated atelier artisans and designers.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Generates collision-safe User ID
 * Format: FF-U[TIMESTAMP_BASE36]-[RANDOM_HEX4]
 */
function generateUserId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FF-U${timestamp}-${randomPart}`;
}

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
      trim: true,
      default: generateUserId
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'User name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Exclude from normal query results for security
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.userId;
        delete ret.passwordHash;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Compares plain text password against stored hash
 *
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
