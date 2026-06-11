// const { query } = require('../config/database');





// class Business {
//   // Get businesses by category
//   static async getByCategory(categoryId, cityId = null) {
//     let sql = `
//       SELECT b.*, c.name as category_name
//       FROM businesses b
//       LEFT JOIN categories c ON b.category_id = c.id
//       WHERE b.category_id = $1 AND b.status = 'approved'
//     `;
//     const params = [categoryId];
    
//     if (cityId) {
//       sql += ` AND b.city_id = $2`;
//       params.push(cityId);
//     }
    
//     sql += ` ORDER BY b.rating DESC`;
    
//     const result = await query(sql, params);
//     return result.rows;
//   }

//   // Get all approved businesses
//   static async getAllApproved() {
//     const sql = `
//       SELECT b.*, c.name as category_name
//       FROM businesses b
//       LEFT JOIN categories c ON b.category_id = c.id
//       WHERE b.status = 'approved'
//       ORDER BY b.created_at DESC
//     `;
//     const result = await query(sql);
//     return result.rows;
//   }

//   // Get single business
//   static async getById(id) {
//     const sql = 'SELECT * FROM businesses WHERE id = $1';
//     const result = await query(sql, [id]);
//     return result.rows[0];
//   }

//   // User submits a new business
//   static async submitBusiness(userId, businessData) {
//     const { category_id, title, address, phone, email, tag, description, images } = businessData;
    
//     const sql = `
//       INSERT INTO businesses (
//         category_id, title, address, phone, email, tag, description, images,
//         status, submitted_by, submitted_at
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, CURRENT_TIMESTAMP)
//       RETURNING *
//     `;
    
//     const values = [category_id, title, address, phone, email, tag, description, images, userId];
//     const result = await query(sql, values);
//     return result.rows[0];
//   }

//   // Get user's submitted businesses
//   static async getUserSubmissions(userId) {
//     const sql = `
//       SELECT b.*, c.name as category_name
//       FROM businesses b
//       LEFT JOIN categories c ON b.category_id = c.id
//       WHERE b.submitted_by = $1
//       ORDER BY b.submitted_at DESC
//     `;
//     const result = await query(sql, [userId]);
//     return result.rows;
//   }

//   // Get pending businesses for admin
//   static async getPendingBusinesses() {
//     const sql = `
//       SELECT b.*, c.name as category_name, u.name as submitter_name, u.phone as submitter_phone
//       FROM businesses b
//       LEFT JOIN categories c ON b.category_id = c.id
//       LEFT JOIN users u ON b.submitted_by = u.id
//       WHERE b.status = 'pending'
//       ORDER BY b.submitted_at ASC
//     `;
//     const result = await query(sql);
//     return result.rows;
//   }

//   // Approve business
//   static async approveBusiness(businessId, adminId) {
//     const sql = `
//       UPDATE businesses 
//       SET status = 'approved', 
//           approved_by = $1, 
//           approved_at = CURRENT_TIMESTAMP
//       WHERE id = $2
//       RETURNING *
//     `;
//     const result = await query(sql, [adminId, businessId]);
//     return result.rows[0];
//   }

//   // Reject business
//   static async rejectBusiness(businessId, adminId, reason) {
//     const sql = `
//       UPDATE businesses 
//       SET status = 'rejected', 
//           rejection_reason = $1,
//           approved_by = $2, 
//           approved_at = CURRENT_TIMESTAMP
//       WHERE id = $3
//       RETURNING *
//     `;
//     const result = await query(sql, [reason, adminId, businessId]);
//     return result.rows[0];
//   }
// }

// module.exports = Business;



const { query } = require('../config/database');

class Business {
  // ==========================================
  // 📖 READ & FETCH OPERATIONS
  // ==========================================

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

  // Get single business by ID
  static async getById(id) {
    const sql = 'SELECT * FROM businesses WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get businesses by specific category
  static async getByCategory(categoryId, cityId = null) {
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.category_id = $1 AND b.status = 'approved'
    `;
    const params = [categoryId];
    let paramIndex = 2;
    
    if (cityId && cityId !== 'null' && cityId !== 'All') {
      sql += ` AND b.city_id = $${paramIndex}`;
      params.push(cityId);
      paramIndex++;
    }
    
    sql += ` ORDER BY b.rating DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  // Get businesses by main category (includes sub-categories)
  static async getByMainCategory(categoryId, cityId = null) {
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      JOIN categories c ON b.category_id = c.id
      WHERE (c.id = $1 OR c.parent_id = $1) AND b.status = 'approved'
    `;
    const params = [categoryId];
    let paramIndex = 2;
    
    if (cityId && cityId !== 'null' && cityId !== 'All') {
      sql += ` AND b.city_id = $${paramIndex}`;
      params.push(cityId);
      paramIndex++;
    }
    
    sql += ` ORDER BY b.rating DESC`;
    const result = await query(sql, params);
    return result.rows;
  }

  // ==========================================
  // 🔍 SEARCH & LOCATION
  // ==========================================

  static async search(searchParams) {
    const { q, category, sortBy, order, minRating, limit = 20, offset = 0 } = searchParams;
    
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'approved'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (q) {
      sql += ` AND (b.title ILIKE $${paramIndex} OR b.address ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    if (category && category !== 'all') {
      sql += ` AND b.category_id = $${paramIndex}`;
      params.push(parseInt(category));
      paramIndex++;
    }
    
    if (minRating) {
      sql += ` AND b.rating >= $${paramIndex}`;
      params.push(parseFloat(minRating));
      paramIndex++;
    }
    
    if (sortBy === 'rating') {
      sql += ` ORDER BY b.rating ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'name') {
      sql += ` ORDER BY b.title ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      sql += ` ORDER BY b.created_at DESC`;
    }
    
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(sql, params);
    return result.rows;
  }

  static async getNearby(lat, lng, radius, limit) {
    const sql = `
      SELECT * FROM (
        SELECT *,
          6371 * acos(
            LEAST(1.0, GREATEST(-1.0, 
              cos(radians($1)) * cos(radians(latitude)) *
              cos(radians(longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(latitude))
            ))
          ) AS distance
        FROM businesses
        WHERE status = 'approved' AND latitude IS NOT NULL AND longitude IS NOT NULL
      ) AS subquery
      WHERE distance < $3
      ORDER BY distance
      LIMIT $4
    `;
    const result = await query(sql, [parseFloat(lat), parseFloat(lng), parseFloat(radius), parseInt(limit)]);
    return result.rows;
  }

  static async getSuggestions(q) {
    const sql = `
      SELECT DISTINCT id, title, address
      FROM businesses
      WHERE status = 'approved' AND (title ILIKE $1 OR address ILIKE $1)
      LIMIT 10
    `;
    const result = await query(sql, [`%${q}%`]);
    return result.rows;
  }

  // ==========================================
  // 📝 SUBMISSIONS & ADMIN
  // ==========================================

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
    const values = [category_id, title, address, phone, email, tag, description, images || [], userId];
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
      SET status = 'approved', approved_by = $1, approved_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *
    `;
    const result = await query(sql, [adminId, businessId]);
    return result.rows[0];
  }

  // Reject business
  static async rejectBusiness(businessId, adminId, reason) {
    const sql = `
      UPDATE businesses 
      SET status = 'rejected', rejection_reason = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
      WHERE id = $3 RETURNING *
    `;
    const result = await query(sql, [reason, adminId, businessId]);
    return result.rows[0];
  }

  // Update Location
  static async updateLocation(businessId, latitude, longitude) {
    const sql = `UPDATE businesses SET latitude = $1, longitude = $2 WHERE id = $3 RETURNING *`;
    const result = await query(sql, [latitude, longitude, businessId]);
    return result.rows[0];
  }

  // ==========================================
  // 📊 ANALYTICS
  // ==========================================

  static async trackView(businessId) {
    const sql = `
      INSERT INTO business_analytics (business_id, views, last_updated)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (business_id) 
      DO UPDATE SET views = business_analytics.views + 1, last_updated = CURRENT_TIMESTAMP
    `;
    await query(sql, [businessId]);
    
    const dailySql = `
      INSERT INTO business_daily_stats (business_id, date, views)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (business_id, date) 
      DO UPDATE SET views = business_daily_stats.views + 1
    `;
    return query(dailySql, [businessId]);
  }

  static async trackClick(businessId, column) {
    const sql = `
      INSERT INTO business_analytics (business_id, ${column}, last_updated)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (business_id) 
      DO UPDATE SET ${column} = business_analytics.${column} + 1, last_updated = CURRENT_TIMESTAMP
    `;
    await query(sql, [businessId]);
    
    const dailySql = `
      INSERT INTO business_daily_stats (business_id, date, clicks)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (business_id, date) 
      DO UPDATE SET clicks = business_daily_stats.clicks + 1
    `;
    return query(dailySql, [businessId]);
  }

  static async getAnalytics(businessId) {
    const sql = `SELECT * FROM business_analytics WHERE business_id = $1`;
    const result = await query(sql, [businessId]);
    return result.rows[0];
  }

  static async getDailyStats(businessId) {
    const sql = `
      SELECT date, views, clicks FROM business_daily_stats
      WHERE business_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC
    `;
    const result = await query(sql, [businessId]);
    return result.rows;
  }

  static async getPopular() {
    const sql = `
      SELECT b.*, a.views, a.clicks, a.shares
      FROM businesses b
      JOIN business_analytics a ON b.id = a.business_id
      WHERE b.status = 'approved'
      ORDER BY a.views DESC
      LIMIT 10
    `;
    const result = await query(sql);
    return result.rows;
  }
}

module.exports = Business;