
// const { query } = require('../config/database');
// const bcrypt = require('bcryptjs');





// class User {

//   // 1. Find user by email
//   static async findByEmail(email) {
//     const sql = 'SELECT * FROM users WHERE email = $1';
//     const result = await query(sql, [email]);
//     return result.rows[0];
//   }

//   // 2. Create new user
//   static async create(userData) {
//     const { name, phone, city, pincode, password, profile_image } = userData;
    
//     // Hash password securely
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
    
//     const sql = `
//       INSERT INTO users (name, phone, city, pincode, password, profile_image)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING id, name, phone, city, pincode, profile_image, role, created_at
//     `;
    
//     const values = [name, phone, city, pincode, hashedPassword, profile_image || null];
//     const result = await query(sql, values);
    
//     return result.rows[0];
//   }
  
//   // 3. Find user by phone
//   static async findByPhone(phone) {
//     const sql = 'SELECT * FROM users WHERE phone = $1';
//     const result = await query(sql, [phone]);
//     return result.rows[0];
//   }
  
//   // 4. Find user by ID (without password)
//   static async findById(id) {
//     // 🟢 FIXED: Added 'role' to the SELECT statement
//     const sql = 'SELECT id, name, phone, city, pincode, profile_image, role, created_at FROM users WHERE id = $1';
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }
  
//   // 5. Find user with password (for password verification)
//   static async findByIdWithPassword(id) {
//     const sql = 'SELECT * FROM users WHERE id = $1';
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }
  
//   // 6. Update user profile
//   static async update(id, updateData) {
//     const { name, city, pincode, profile_image } = updateData;
//     const sql = `
//       UPDATE users 
//       SET name = COALESCE($1, name),
//           city = COALESCE($2, city),
//           pincode = COALESCE($3, pincode),
//           profile_image = COALESCE($4, profile_image),
//           updated_at = CURRENT_TIMESTAMP
//       WHERE id = $5
//       RETURNING id, name, phone, city, pincode, profile_image, role, updated_at
//     `;
    
//     const values = [name, city, pincode, profile_image, id];
//     const result = await query(sql, values);
//     return result.rows[0];
//   }
  
//   // 7. Update profile image only
//   static async updateProfileImage(id, imageUrl) {
//     const sql = 'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
//     await query(sql, [imageUrl, id]);
//     return true;
//   }
  
//   // 8. Update password
//   static async updatePassword(id, newPassword) {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
    
//     const sql = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
//     await query(sql, [hashedPassword, id]);
//     return true;
//   }
  
//   // 9. Verify password
//   static async verifyPassword(plainPassword, hashedPassword) {
//     return await bcrypt.compare(plainPassword, hashedPassword);
//   }
  
//   // 10. Delete user
//   static async delete(id) {
//     const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }
  
//   // 11. Get all users (admin only)
//   static async getAll(limit = 100, offset = 0) {
   
//     const sql = `
//       SELECT id, name, phone, city, pincode, profile_image, role, created_at 
//       FROM users 
//       ORDER BY created_at DESC 
//       LIMIT $1 OFFSET $2
//     `;
//     const result = await query(sql, [limit, offset]);
//     return result.rows;
//   }
  
//   // 12. Count total users
//   static async count() {
//     const sql = 'SELECT COUNT(*) FROM users';
//     const result = await query(sql);
//     return parseInt(result.rows[0].count);
//   }
// }

// module.exports = User;


const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {

  // 1. Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // 2. Create new user (🟢 FIXED: Added email support for Social Logins)
  static async create(userData) {
    const { name, phone, email, city, pincode, password, profile_image } = userData;
    
    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const sql = `
      INSERT INTO users (name, phone, email, city, pincode, password, profile_image)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, phone, email, city, pincode, profile_image, role, created_at
    `;
    
    const values = [
      name, 
      phone, 
      email || null, // Allow null if registering via phone only
      city || 'Dhrangadhra', 
      pincode || '363310', 
      hashedPassword, 
      profile_image || null
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  // 3. Find user by phone
  static async findByPhone(phone) {
    const sql = 'SELECT * FROM users WHERE phone = $1';
    const result = await query(sql, [phone]);
    return result.rows[0];
  }
  
  // 4. Find user by ID (Secured: No Password)
  static async findById(id) {
    const sql = `
      SELECT id, name, phone, email, city, pincode, profile_image, role, created_at 
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // 5. Find user with password (for password verification/login)
  static async findByIdWithPassword(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // 6. Update user profile (🟢 FIXED: Added email support)
  static async update(id, updateData) {
    const { name, email, city, pincode, profile_image } = updateData;
    const sql = `
      UPDATE users 
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          city = COALESCE($3, city),
          pincode = COALESCE($4, pincode),
          profile_image = COALESCE($5, profile_image),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, name, phone, email, city, pincode, profile_image, role, updated_at
    `;
    
    const values = [name, email, city, pincode, profile_image, id];
    const result = await query(sql, values);
    return result.rows[0];
  }
  
  // 7. Update profile image only
  static async updateProfileImage(id, imageUrl) {
    const sql = 'UPDATE users SET profile_image = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING profile_image';
    const result = await query(sql, [imageUrl, id]);
    return result.rows[0];
  }
  
  // 8. Update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const sql = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await query(sql, [hashedPassword, id]);
    return true;
  }
  
  // 9. Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // 10. Deactivate user (🟢 FIXED: Soft Delete prevents database crashes)
  static async deactivate(id) {
    const sql = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Legacy Hard Delete (Use ONLY for testing, never in production)
  static async hardDelete(id) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
  
  // 11. Get all users (admin only)
  static async getAll(limit = 100, offset = 0) {
    const sql = `
      SELECT id, name, phone, email, city, pincode, profile_image, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    return result.rows;
  }
  
  // 12. Count total users
  static async count() {
    const sql = 'SELECT COUNT(*) FROM users';
    const result = await query(sql);
    return parseInt(result.rows[0].count);
  }
}

module.exports = User;