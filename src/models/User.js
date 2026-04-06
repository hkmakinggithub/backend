const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {

  // Add these to your existing User class

// Find user by email
static async findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = $1';
  const result = await query(sql, [email]);
  return result.rows[0];
}

// Add these columns to your database
// ALTER TABLE users ADD COLUMN google_id VARCHAR(100);
// ALTER TABLE users ADD COLUMN facebook_id VARCHAR(100);
// ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
  // Create new user
  static async create(userData) {
    const { name, phone, city, pincode, password, profile_image } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const sql = `
      INSERT INTO users (name, phone, city, pincode, password, profile_image)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, phone, city, pincode, profile_image, created_at
    `;
    
    const values = [name, phone, city, pincode, hashedPassword, profile_image || null];
    const result = await query(sql, values);
    
    return result.rows[0];
  }
  
  // Find user by phone
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM users WHERE phone = $1';
    const result = await query(sql, [phone]);
    return result.rows[0];
  }
  
  // Find user by ID (without password)
  static async findById(id) {
    const sql = 'SELECT id, name, phone, city, pincode, profile_image, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // Find user with password (for password verification)
  static async findByIdWithPassword(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // Update user profile
  static async update(id, updateData) {
    const { name, city, pincode, profile_image } = updateData;
    const sql = `
      UPDATE users 
      SET name = COALESCE($1, name),
          city = COALESCE($2, city),
          pincode = COALESCE($3, pincode),
          profile_image = COALESCE($4, profile_image),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, phone, city, pincode, profile_image, updated_at
    `;
    
    const values = [name, city, pincode, profile_image, id];
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  // Update profile image only
  static async updateProfileImage(id, imageUrl) {
    const sql = 'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await query(sql, [imageUrl, id]);
    return true;
  }
  
  // Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const sql = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await query(sql, [hashedPassword, id]);
    return true;
  }
  
  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // Get all users (admin only)
  static async getAll(limit = 100, offset = 0) {
    const sql = `
      SELECT id, name, phone, city, pincode, profile_image, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
  
  // Count total users
  static async count() {
    const sql = 'SELECT COUNT(*) FROM users';
    const result = await query(sql);
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;