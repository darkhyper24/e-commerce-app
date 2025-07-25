const { Sequelize } = require('sequelize');
const { User } = require('../models/users');
const { comparePassword } = require('../middleware/passwordMiddleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY; 
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;  


const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  
  return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh-token', 
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};


const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ 
      where: { 
        [Sequelize.Op.or]: [{ username }, { email }] 
      } 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this username or email' 
      });
    }
    
    const user = await User.create({
      username,
      email,
      password,
      phone
    });
    
    const { accessToken, refreshToken } = generateTokens(user);
    
    setTokenCookies(res, accessToken, refreshToken);
    
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone
    };
    
    return res.status(201).json({ 
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    setTokenCookies(res, accessToken, refreshToken);
    
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone
    };
    
    return res.status(200).json({ 
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    return res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh-token' });
  return res.status(200).json({ message: 'Logged out successfully' });
};

const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'phone']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  profile
};