// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');

// // Public routes
// router.post('/register', authController.register);
// router.post('/login', authController.login);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

// // Protected routes (require authentication)
// router.get('/me', protect, authController.getMe);
// router.put('/profile', protect, authController.updateProfile);
// router.post('/logout', protect, authController.logout);

// // Test route
// router.get('/test', (req, res) => {
//   res.json({ success: true, message: 'Auth routes working!' });
// });
// // OTP Routes
// router.post('/send-otp', authController.sendLoginOTP);
// router.post('/verify-otp', authController.verifyOTPAndLogin);

// // Social Login Routes
// router.post('/google-login', authController.googleLogin);
// router.post('/facebook-login', authController.facebookLogin);
// // Add these routes
// router.post('/change-password', protect, authController.changePassword);
// router.get('/my-businesses', protect, authController.getMyBusinesses);
// router.post('/upload-profile-picture', protect, authController.uploadProfilePicture);
// module.exports = router;



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 🔑 ==========================================
// PUBLIC AUTHENTICATION ROUTES (No Token Needed)
// ==========================================

// Standard Credentials Routing
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password Recovery Routing
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// OTP Phone Verification Routing
router.post('/send-otp', authController.sendLoginOTP);
router.post('/verify-otp', authController.verifyOTPAndLogin);

// OAuth Social Access Routing
router.post('/google-login', authController.googleLogin);
router.post('/facebook-login', authController.facebookLogin);


// 🔒 ==========================================
// PROTECTED USER ACTION ROUTES (Requires Valid JWT Token)
// ==========================================

// Core User Account Actions
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

// Profile Asset Routing
router.post('/upload-profile-picture', protect, authController.uploadProfilePicture);

// User-Owned Data Management Routing
router.get('/my-businesses', protect, authController.getMyBusinesses);


// 🛠️ ==========================================
// SYSTEM TESTING & VERIFICATION ROUTES
// ==========================================

// Server Connectivity Health-Check Route (Protected to keep logs clean)
router.get('/test', protect, (req, res) => {
  res.json({ success: true, message: 'Auth routing system working perfectly!' });
});

module.exports = router;