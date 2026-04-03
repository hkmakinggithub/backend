const { query } = require('../config/database');

class Category {
  // Get all categories
  static async getAll() {
    const sql = 'SELECT * FROM categories WHERE is_active = true ORDER BY name';
    const result = await query(sql);
    return result.rows;
  }

  // Get category by ID
  static async getById(id) {
    const sql = 'SELECT * FROM categories WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Create new category (admin only)
  static async create(name, icon, description) {
    const sql = `
      INSERT INTO categories (name, icon, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sql, [name, icon, description]);
    return result.rows[0];
  }

  // Update category (admin only)
  static async update(id, name, icon, description) {
    const sql = `
      UPDATE categories 
      SET name = COALESCE($1, name),
          icon = COALESCE($2, icon),
          description = COALESCE($3, description),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await query(sql, [name, icon, description, id]);
    return result.rows[0];
  }

  // Delete category (admin only)
  static async delete(id) {
    const sql = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = Category;