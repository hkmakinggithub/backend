// const { query } = require('../config/database');


// // Get reviews for a business
// const getBusinessReviews = async (req, res) => {
//   try {
//     const { businessId } = req.params;
//     const { page = 1, limit = 20 } = req.query;
//     const offset = (page - 1) * limit;
    
//     const sql = `
//       SELECT r.*, u.name as user_name, u.profile_image as user_image
//       FROM reviews r
//       JOIN users u ON r.user_id = u.id
//       WHERE r.business_id = $1
//       ORDER BY r.created_at DESC
//       LIMIT $2 OFFSET $3
//     `;
    
//     const result = await query(sql, [businessId, limit, offset]);
    
//     // Get total count
//     const countSql = 'SELECT COUNT(*) as total FROM reviews WHERE business_id = $1';
//     const countResult = await query(countSql, [businessId]);
//     const total = parseInt(countResult.rows[0].total);
    
//     res.json({
//       success: true,
//       data: result.rows,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         totalPages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get reviews error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch reviews'
//     });
//   }
// };

// // Add a review
// const addReview = async (req, res) => {
//   try {
//     const { businessId } = req.params;
//     const { rating, comment, images } = req.body;
//     const userId = req.user.id;
    
  
    
//     // Check if user has already reviewed
//     const checkSql = 'SELECT id FROM reviews WHERE business_id = $1 AND user_id = $2';
//     const checkResult = await query(checkSql, [businessId, userId]);
    
//     if (checkResult.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'You have already reviewed this business'
//       });
//     }
    
//     // Insert review
//     const sql = `
//       INSERT INTO reviews (business_id, user_id, rating, comment, images)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//     `;
    
//     const result = await query(sql, [businessId, userId, rating, comment, images || []]);
    
//     // Update business average rating
//     await updateBusinessRating(businessId);
    
//     res.status(201).json({
//       success: true,
//       message: 'Review added successfully',
//       data: result.rows[0]
//     });
//   } catch (error) {
//     console.error('Add review error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add review: ' + error.message
//     });
//   }
// };

// // Update a review
// const updateReview = async (req, res) => {
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
//         message: 'Review not found or you are not authorized'
//       });
//     }
    
//     // Get business id to update rating
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
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update review'
//     });
//   }
// };

// // Delete a review
// const deleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const userId = req.user.id;
    
//     // Get business id before deleting
//     const businessSql = 'SELECT business_id FROM reviews WHERE id = $1';
//     const businessResult = await query(businessSql, [reviewId]);
    
//     const sql = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id';
//     const result = await query(sql, [reviewId, userId]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Review not found or you are not authorized'
//       });
//     }
    
//     // Update business rating
//     if (businessResult.rows[0]) {
//       await updateBusinessRating(businessResult.rows[0].business_id);
//     }
    
//     res.json({
//       success: true,
//       message: 'Review deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete review error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete review'
//     });
//   }
// };

// // Get user's review for a business
// const getUserReview = async (req, res) => {
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
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch user review'
//     });
//   }
// };

// // Helper function to update business average rating
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

// module.exports = {
//   getBusinessReviews,
//   addReview,
//   updateReview,
//   deleteReview,
//   getUserReview
// };

const Review = require('../models/Review');

// Get reviews for a business
const getBusinessReviews = async (req, res) => {
  try {
    const { businessId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const reviews = await Review.getByBusinessId(businessId, limit, offset);
    const total = await Review.getCountByBusinessId(businessId);
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// Add a review
const addReview = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;
    
    // 1. Prevent duplicate reviews
    const hasReviewed = await Review.hasUserReviewed(businessId, userId);
    if (hasReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this business' });
    }
    
    // 2. Create the review
    const newReview = await Review.create(businessId, userId, rating, comment, images || []);
    
    // 3. Update the business's average rating
    await Review.updateBusinessRating(businessId);
    
    res.status(201).json({ success: true, message: 'Review added successfully', data: newReview });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    const updatedReview = await Review.update(reviewId, userId, rating, comment);
    
    if (!updatedReview) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }
    
    await Review.updateBusinessRating(updatedReview.business_id);
    
    res.json({ success: true, message: 'Review updated successfully', data: updatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    
    const deletedReview = await Review.delete(reviewId, userId);
    
    if (!deletedReview) {
      return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
    }
    
    // deletedReview contains the business_id because of the RETURNING clause in the Model
    await Review.updateBusinessRating(deletedReview.business_id);
    
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
};

// Get user's review for a business
const getUserReview = async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;
    
    const review = await Review.getUserReview(businessId, userId);
    
    res.json({ success: true, data: review || null });
  } catch (error) {
    console.error('Get user review error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user review' });
  }
};

module.exports = {
  getBusinessReviews,
  addReview,
  updateReview,
  deleteReview,
  getUserReview
};