const express = require('express');

const router = express.Router();

const businessController = require('../controllers/businessController');

const { protect } = require('../middleware/authMiddleware');




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
// Add this route BEFORE the generic /:id route
router.get('/category/main/:categoryId', businessController.getBusinessesByMainCategory);
// ============= GENERIC ROUTES LAST =============
// Get all businesses from main category (includes all sub-categories)
router.get('/category/main/:categoryId', businessController.getBusinessesByMainCategory);
// Get all businesses
router.get('/', businessController.getAllBusinesses);

// Get single business (MUST BE LAST)
router.get('/:id', businessController.getBusiness);
// Analytics routes
router.post('/:businessId/track-view', businessController.trackBusinessView);
router.post('/:businessId/track-click', businessController.trackBusinessClick);
router.get('/:businessId/analytics', protect, businessController.getBusinessAnalytics);
router.get('/analytics/popular', businessController.getPopularBusinesses);
module.exports = router;