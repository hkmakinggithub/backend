const express = require('express');
const router = express.Router();

const newsController = require('../controllers/newsController');
// 🟢 ADDED: Security middleware to protect admin routes
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES (Mobile App)
// ==========================================

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'News routes working!' });
});

router.get('/active', newsController.getActiveNews);

// ==========================================
// 🔒 ADMIN ROUTES (Admin Panel)
// ==========================================

router.get('/all', protect, adminOnly, newsController.getAllNews);
router.post('/create', protect, adminOnly, newsController.addNews);
router.put('/edit/:id', protect, adminOnly, newsController.updateNews);
router.delete('/delete/:id', protect, adminOnly, newsController.deleteNews);
router.put('/toggle/:id', protect, adminOnly, newsController.toggleActiveStatus);

// 404 handler for news routes
router.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.originalUrl} not found in news routes` 
  });
});

module.exports = router;