const { query } = require('../config/database');

class Review {
  // Create a new review
  static async create(businessId, userId, rating, comment, images = []) {
    const sql = `
      INSERT INTO reviews (business_id, user_id, rating, comment, images)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await query(sql, [businessId, userId, rating, comment, images]);
    return result.rows[0];
  }

  // Get reviews for a business
  static async getByBusinessId(businessId, limit = 20, offset = 0) {
    const sql = `
      SELECT r.*, u.name as user_name, u.profile_image as user_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.business_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [businessId, limit, offset]);
    return result.rows;
  }

  // Get total review count for a business
  static async getCountByBusinessId(businessId) {
    const sql = 'SELECT COUNT(*) as total FROM reviews WHERE business_id = $1';
    const result = await query(sql, [businessId]);
    return parseInt(result.rows[0].total);
  }

  // Get review by ID
  static async getById(reviewId) {
    const sql = `
      SELECT r.*, u.name as user_name, u.profile_image as user_image
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    const result = await query(sql, [reviewId]);
    return result.rows[0];
  }

  // Update review
  static async update(reviewId, userId, rating, comment) {
    const sql = `
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    const result = await query(sql, [rating, comment, reviewId, userId]);
    return result.rows[0];
  }

  // Delete review
  static async delete(reviewId, userId) {
    const sql = 'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await query(sql, [reviewId, userId]);
    return result.rows[0];
  }

  // Check if user has already reviewed this business
  static async hasUserReviewed(businessId, userId) {
    const sql = 'SELECT id FROM reviews WHERE business_id = $1 AND user_id = $2';
    const result = await query(sql, [businessId, userId]);
    return result.rows.length > 0;
  }

  // Get user's review for a business
  static async getUserReview(businessId, userId) {
    const sql = 'SELECT * FROM reviews WHERE business_id = $1 AND user_id = $2';
    const result = await query(sql, [businessId, userId]);
    return result.rows[0];
  }
}

module.exports = Review;