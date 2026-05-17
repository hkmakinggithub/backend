const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Debug middleware to log all requests to news routes
router.use((req, res, next) => {
  console.log(`📰 News Route Hit: ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'News routes working!' });
});

// 📱 PUBLIC ROUTE
router.get('/active', newsController.getActiveNews);

// 💻 ADMIN ROUTES
router.get('/all', newsController.getAllNews);
router.post('/create', newsController.addNews);
router.put('/edit/:id', newsController.updateNews);
router.delete('/delete/:id', newsController.deleteNews);
router.put('/toggle/:id', newsController.toggleActiveStatus); // ✅ USE PUT INSTEAD!
// 404 handler for news routes
router.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.originalUrl} not found in news routes` 
  });
});

module.exports = router;