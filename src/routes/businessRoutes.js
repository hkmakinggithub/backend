const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

// ============= SPECIFIC ROUTES FIRST =============

// Search routes
router.get('/search', businessController.searchBusinesses);
router.get('/suggestions', businessController.getSearchSuggestions);

// Nearby businesses route (BEFORE :id)
router.get('/nearby', businessController.getNearbyBusinesses);

// User submission routes
router.post('/submit', protect, businessController.submitBusiness);
router.get('/my-submissions', protect, businessController.getUserSubmissions);

// Admin routes
router.get('/admin/pending', protect, businessController.getPendingBusinesses);
router.put('/admin/approve/:businessId', protect, businessController.approveBusiness);
router.put('/admin/reject/:businessId', protect, businessController.rejectBusiness);
router.put('/:id/location', protect, businessController.updateBusinessLocation);

// Category route
router.get('/category/:categoryId', businessController.getBusinessesByCategory);

// ============= GENERIC ROUTES LAST =============

// Get all businesses
router.get('/', businessController.getAllBusinesses);

// Get single business (MUST BE LAST)
router.get('/:id', businessController.getBusiness);

module.exports = router;