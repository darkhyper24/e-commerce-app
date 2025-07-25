const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
/**
 * Hash a password using bcrypt
 * @param {string} password 
 * @returns {Promise<string>} hashedPassword
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
};
/**
 * Compare a password with a hashed password
 * @param {string} password - Plain text password to verify
 * @param {string} hashedPassword - Stored hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Password comparison failed');
  }
};
/**
 * Middleware to hash password in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const hashPasswordMiddleware = async (req, res, next) => {
  try {
    if (req.body && req.body.password) {
      req.body.password = await hashPassword(req.body.password);
    }
    next();
  } catch (error) {
    console.error('Password middleware error:', error);
    res.status(500).json({ error: 'Password processing failed' });
  }
};
module.exports = {
  hashPassword,
  comparePassword,
  hashPasswordMiddleware
};