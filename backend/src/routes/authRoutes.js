const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { hashPasswordMiddleware } = require('../middleware/passwordMiddleware');
const router = express.Router();

router.post("/login", authController.login);
router.post("/register", hashPasswordMiddleware, authController.register);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/profile", authenticateToken, authController.profile);

module.exports = router;