const { query } = require('../config/database');

class City {
  // ==========================================
  // 📖 PUBLIC READ OPERATIONS
  // ==========================================

  // Get all active cities
  static async getAllActive() {
    const sql = 'SELECT * FROM cities WHERE is_active = true ORDER BY name ASC';
    const result = await query(sql);
    return result.rows;
  }

  // Get single city by ID
  static async getById(id) {
    const sql = 'SELECT * FROM cities WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all approved businesses within a specific city
  static async getBusinessesByCity(cityId) {
    const sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.city_id = $1 AND b.status = 'approved'
      ORDER BY b.created_at DESC
    `;
    const result = await query(sql, [cityId]);
    return result.rows;
  }

  // ==========================================
  // 🛠️ ADMIN OPERATIONS
  // ==========================================

  // Create a new city
  static async create(name, state) {
    const sql = `
      INSERT INTO cities (name, state, is_active) 
      VALUES ($1, $2, true) 
      RETURNING *
    `;
    const result = await query(sql, [name, state || null]);
    return result.rows[0];
  }

  // Soft Delete / Toggle Status (Prevents DB crashes)
  static async toggleStatus(id, isActive) {
    const sql = `
      UPDATE cities 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await query(sql, [isActive, id]);
    return result.rows[0];
  }
}

module.exports = City;