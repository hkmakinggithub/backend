const { query } = require('../config/database');

class Favorite {
  // Get all favorited businesses for a user
  static async getUserFavorites(userId) {
    const sql = `
      SELECT b.*, f.created_at as favorited_at
      FROM favorites f
      JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = $1 AND b.status = 'approved'
      ORDER BY f.created_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Check if a business is already favorited
  static async check(userId, businessId) {
    const sql = 'SELECT id FROM favorites WHERE user_id = $1 AND business_id = $2';
    const result = await query(sql, [userId, businessId]);
    return result.rows.length > 0;
  }

  // Add to favorites
  static async add(userId, businessId) {
    // Prevent duplicate entries
    const exists = await this.check(userId, businessId);
    if (exists) return { alreadyExists: true };

    const sql = `
      INSERT INTO favorites (user_id, business_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    const result = await query(sql, [userId, businessId]);
    return { alreadyExists: false, data: result.rows[0] };
  }

  // Remove from favorites
  static async remove(userId, businessId) {
    const sql = 'DELETE FROM favorites WHERE user_id = $1 AND business_id = $2 RETURNING id';
    const result = await query(sql, [userId, businessId]);
    return result.rows[0];
  }
}

module.exports = Favorite;