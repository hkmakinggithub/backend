// const express = require('express');

// const router = express.Router();

// const { query } = require('../config/database');

// const { protect } = require('../middleware/authMiddleware');



// async function updateBusinessRating(businessId) {
//   const sql = `
//     UPDATE businesses 
//     SET avg_rating = (
//       SELECT COALESCE(AVG(rating), 0) 
//       FROM reviews 
//       WHERE business_id = $1
//     ),
//     total_reviews = (
//       SELECT COUNT(*)   
//       FROM reviews 
//       WHERE business_id = $1
//     )
//     WHERE id = $1
//   `;
//   await query(sql, [businessId]);
// }

// // Get reviews for a business (Public)
// router.get('/business/:businessId', async (req, res) => {
//   try {
//     const { businessId } = req.params;
//     const sql = `
//       SELECT r.*, u.name as user_name, u.profile_image as user_image
//       FROM reviews r
//       JOIN users u ON r.user_id = u.id
//       WHERE r.business_id = $1
//       ORDER BY r.created_at DESC
//     `;
//     const result = await query(sql, [businessId]);
    
//     res.json({
//       success: true,
//       data: result.rows
//     });
//   } catch (error) {
//     console.error('Get reviews error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// // Add a review (Protected)
// router.post('/business/:businessId', protect, async (req, res) => {
//   try {
//     const { businessId } = req.params;
//     const { rating, comment } = req.body;
//     const userId = req.user.id;
    
  
    
//     // Insert review
//     const sql = `
//       INSERT INTO reviews (business_id, user_id, rating, comment)
//       VALUES ($1, $2, $3, $4)
//       RETURNING *
//     `;
    
//     const result = await query(sql, [businessId, userId, rating, comment]);
    
//     // Update business rating
//     await updateBusinessRating(businessId);
    
//     res.status(201).json({
//       success: true,
//       message: 'Review added successfully',
//       data: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Add review error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });



// // Update a review (Protected)
// router.put('/:reviewId', protect, async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { rating, comment } = req.body;
//     const userId = req.user.id;
    
//     const sql = `
//       UPDATE reviews 
//       SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
//       WHERE id = $3 AND user_id = $4
//       RETURNING *
//     `;
    
//     const result = await query(sql, [rating, comment, reviewId, userId]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Review not found or unauthorized'
//       });
//     }
    
//     const businessSql = 'SELECT business_id FROM reviews WHERE id = $1';
//     const businessResult = await query(businessSql, [reviewId]);
//     if (businessResult.rows[0]) {
//       await updateBusinessRating(businessResult.rows[0].business_id);
//     }
    
//     res.json({
//       success: true,
//       message: 'Review updated successfully',
//       data: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Update review error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });




// // Delete a review (Protected)
// router.delete('/:reviewId', protect, async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const userId = req.user.id;
    
//     const businessSql = 'SELECT business_id FROM reviews WHERE id = $1';
//     const businessResult = await query(businessSql, [reviewId]);
    
//     const sql = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id';
//     const result = await query(sql, [reviewId, userId]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Review not found or unauthorized'
//       });
//     }
    
//     if (businessResult.rows[0]) {
//       await updateBusinessRating(businessResult.rows[0].business_id);
//     }
    
//     res.json({
//       success: true,
//       message: 'Review deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete review error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });




// // Get user's review for a business (Protected)
// router.get('/business/:businessId/user', protect, async (req, res) => {
//   try {
//     const { businessId } = req.params;
//     const userId = req.user.id;
    
//     const sql = 'SELECT * FROM reviews WHERE business_id = $1 AND user_id = $2';
//     const result = await query(sql, [businessId, userId]);
    
//     res.json({
//       success: true,
//       data: result.rows[0] || null
//     });
//   } catch (error) {
//     console.error('Get user review error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });



// module.exports = router;


const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================

// Get all reviews for a business
router.get('/business/:businessId', reviewController.getBusinessReviews);

// ==========================================
// 🔒 PROTECTED ROUTES
// ==========================================

// Submit a new review
router.post('/business/:businessId', protect, reviewController.addReview);

// Check if the current user has reviewed this business
router.get('/business/:businessId/user', protect, reviewController.getUserReview);

// Update or delete an existing review
router.put('/:reviewId', protect, reviewController.updateReview);
router.delete('/:reviewId', protect, reviewController.deleteReview);

module.exports = router;