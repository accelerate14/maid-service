const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const authController = require('../controllers/authController');

// Register Customer
router.post('/register', validateBody('register'), authController.register);

// Google Auth
router.post('/google-auth', validateBody('googleAuth'), authController.googleAuth);

// Login
router.post('/login', validateBody('login'), authController.login);

// Forgot Password
router.post('/forgot-password', validateBody('forgotPassword'), authController.forgotPassword);

// Reset Password
router.post('/reset-password', validateBody('resetPassword'), authController.resetPassword);

// Refresh Token
router.post('/refresh-token', validateBody('refreshToken'), authController.refreshToken);

// Profile
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateBody('profile'), authController.updateProfile);

module.exports = router;
