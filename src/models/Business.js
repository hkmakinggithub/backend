const { query } = require('../config/database');

class Business {
  // Get businesses by category
  static async getByCategory(categoryId, cityId = null) {
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.category_id = $1 AND b.status = 'approved'
    `;
    const params = [categoryId];
    
    if (cityId) {
      sql += ` AND b.city_id = $2`;
      params.push(cityId);
    }
    
    sql += ` ORDER BY b.rating DESC`;
    
    const result = await query(sql, params);
    return result.rows;
  }

  // Get all approved businesses
  static async getAllApproved() {
    const sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'approved'
      ORDER BY b.created_at DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Get single business
  static async getById(id) {
    const sql = 'SELECT * FROM businesses WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // User submits a new business
  static async submitBusiness(userId, businessData) {
    const { category_id, title, address, phone, email, tag, description, images } = businessData;
    
    const sql = `
      INSERT INTO businesses (
        category_id, title, address, phone, email, tag, description, images,
        status, submitted_by, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [category_id, title, address, phone, email, tag, description, images, userId];
    const result = await query(sql, values);
    return result.rows[0];
  }

  // Get user's submitted businesses
  static async getUserSubmissions(userId) {
    const sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.submitted_by = $1
      ORDER BY b.submitted_at DESC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get pending businesses for admin
  static async getPendingBusinesses() {
    const sql = `
      SELECT b.*, c.name as category_name, u.name as submitter_name, u.phone as submitter_phone
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.status = 'pending'
      ORDER BY b.submitted_at ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Approve business
  static async approveBusiness(businessId, adminId) {
    const sql = `
      UPDATE businesses 
      SET status = 'approved', 
          approved_by = $1, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [adminId, businessId]);
    return result.rows[0];
  }

  // Reject business
  static async rejectBusiness(businessId, adminId, reason) {
    const sql = `
      UPDATE businesses 
      SET status = 'rejected', 
          rejection_reason = $1,
          approved_by = $2, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [reason, adminId, businessId]);
    return result.rows[0];
  }
}

module.exports = Business;