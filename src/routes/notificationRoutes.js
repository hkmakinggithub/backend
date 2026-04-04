const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (require login)
router.post('/register-token', protect, notificationController.registerPushToken);
router.get('/', protect, notificationController.getNotifications);
router.put('/:notificationId/read', protect, notificationController.markAsRead);

// Admin routes
router.post('/send', protect, notificationController.sendToUser);
router.post('/send-to-all', protect, notificationController.sendToAll);

module.exports = router;