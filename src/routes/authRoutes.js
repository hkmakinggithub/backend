

const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');



router.post('/register', authController.register);
router.post('/login', authController.login);


router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// OTP Phone Verification Routing
router.post('/send-otp', authController.sendLoginOTP);
router.post('/verify-otp', authController.verifyOTPAndLogin);

// OAuth Social Access Routing
router.post('/google-login', authController.googleLogin);
router.post('/facebook-login', authController.facebookLogin);




router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);


router.post('/upload-profile-picture', protect, authController.uploadProfilePicture);

router.get('/my-businesses', protect, authController.getMyBusinesses);




// Server Connectivity Health-Check Route (Protected to keep logs clean)
router.get('/test', protect, (req, res) => {
  res.json({ success: true, message: 'Auth routing system working perfectly!' });
});

module.exports = router;