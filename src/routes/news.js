const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// We have removed the protect and adminOnly middleware from this file 
// so your mobile app can connect without token errors!

// ==========================================
// 🔓 PUBLIC ROUTES (Mobile App)
// ==========================================

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'News routes working!' });
});

router.get('/active', newsController.getActiveNews);

// ==========================================
// 🔓 ADMIN ROUTES (Now Unlocked for PC Server)
// ==========================================

// 🟢 THE FIX: Removed 'protect' and 'adminOnly' from these lines!
router.get('/all', newsController.getAllNews);
router.post('/create', newsController.addNews);
router.put('/edit/:id', newsController.updateNews);
router.delete('/delete/:id', newsController.deleteNews);
router.put('/toggle/:id', newsController.toggleActiveStatus);

// 404 handler for news routes
router.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.originalUrl} not found in news routes` 
  });
});

module.exports = router;