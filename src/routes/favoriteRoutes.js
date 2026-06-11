// const express = require('express');
// const router = express.Router();
// const favoriteController = require('../controllers/favoriteController');
// const { protect } = require('../middleware/authMiddleware');

// // All routes require authentication
// router.use(protect);

// // Routes
// router.get('/', favoriteController.getFavorites);
// router.post('/', favoriteController.addFavorite);
// router.delete('/:businessId', favoriteController.removeFavorite);
// router.get('/check/:businessId', favoriteController.checkFavorite);

// module.exports = router;


const express = require('express');
const router = express.Router();

const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🔒 ALL FAVORITE ROUTES ARE PROTECTED
// ==========================================

// Get all favorites for the logged-in user
router.get('/', protect, favoriteController.getFavorites);

// Add a new favorite (Expects business_id in req.body)
router.post('/', protect, favoriteController.addFavorite);

// Remove a favorite
router.delete('/:businessId', protect, favoriteController.removeFavorite);

// Check if a specific business is favorited
router.get('/check/:businessId', protect, favoriteController.checkFavorite);

module.exports = router;