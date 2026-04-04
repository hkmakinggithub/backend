const { query } = require('../config/database');

class Notification {
  // Create notification
  static async create(userId, title, body, type = 'info', data = {}) {
    const sql = `
      INSERT INTO notifications (user_id, title, body, type, data, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await query(sql, [userId, title, body, type, JSON.stringify(data)]);
    return result.rows[0];
  }
  
  // Get user's notifications
  static async getUserNotifications(userId, limit = 50) {
    const sql = `
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await query(sql, [userId, limit]);
    return result.rows;
  }
  
  // Mark as read
  static async markAsRead(notificationId, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await query(sql, [notificationId, userId]);
    return result.rows[0];
  }
  
  // Get unread count
  static async getUnreadCount(userId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await query(sql, [userId]);
    return parseInt(result.rows[0].count);
  }
  
  // Save push token
  static async savePushToken(userId, pushToken) {
    const sql = `
      INSERT INTO push_tokens (user_id, token, created_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE
      SET token = $2, updated_at = CURRENT_TIMESTAMP
    `;
    await query(sql, [userId, pushToken]);
  }
  
  // Get user's push token
  static async getPushToken(userId) {
    const sql = 'SELECT token FROM push_tokens WHERE user_id = $1';
    const result = await query(sql, [userId]);
    return result.rows[0]?.token;
  }
  
  // Get all push tokens
  static async getAllPushTokens() {
    const sql = 'SELECT user_id, token FROM push_tokens';
    const result = await query(sql);
    return result.rows;
  }
}

module.exports = Notification;