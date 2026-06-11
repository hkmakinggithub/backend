const { query } = require('../config/database');

class Admin {
  // ==========================================
  // 📊 DASHBOARD & STATS
  // ==========================================
  
  static async getDashboardStats() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM businesses WHERE status = 'approved') as total_businesses,
        (SELECT COUNT(*) FROM businesses WHERE status = 'pending') as pending_businesses,
        (SELECT COUNT(*) FROM businesses WHERE status = 'rejected') as rejected_businesses,
        (SELECT COUNT(*) FROM categories WHERE level = 1) as total_categories,
        (SELECT COUNT(*) FROM categories WHERE level = 2) as total_subcategories,
        (SELECT COUNT(*) FROM cities) as total_cities,
        (SELECT COUNT(*) FROM reviews) as total_reviews,
        (SELECT COALESCE(ROUND(AVG(rating), 1), 0) FROM reviews) as avg_rating
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  static async getDashboardStatsByCity(cityId) {
    const cityCheck = await query('SELECT id, name FROM cities WHERE id = $1', [cityId]);
    if (cityCheck.rows.length === 0) return null;
    
    const cityName = cityCheck.rows[0].name;
    
    const businessesResult = await query(`SELECT COUNT(*) as count FROM businesses WHERE city_id = $1 AND status = 'approved'`, [cityId]);
    const pendingResult = await query(`SELECT COUNT(*) as count FROM businesses WHERE city_id = $1 AND status = 'pending'`, [cityId]);
    const usersResult = await query('SELECT COUNT(*) as count FROM users'); 
    const categoriesResult = await query('SELECT COUNT(*) as count FROM categories WHERE level = 1');
    const reviewsResult = await query(`
      SELECT COUNT(r.id) as total_reviews, COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
      FROM reviews r JOIN businesses b ON r.business_id = b.id WHERE b.city_id = $1
    `, [cityId]);
    
    return {
      total_users: parseInt(usersResult.rows[0]?.count || 0),
      total_businesses: parseInt(businessesResult.rows[0]?.count || 0),
      pending_businesses: parseInt(pendingResult.rows[0]?.count || 0),
      total_categories: parseInt(categoriesResult.rows[0]?.count || 0),
      total_reviews: parseInt(reviewsResult.rows[0]?.total_reviews || 0),
      avg_rating: parseFloat(reviewsResult.rows[0]?.avg_rating || 0),
      city_name: cityName
    };
  }

  // ==========================================
  // 👥 USERS MANAGEMENT
  // ==========================================

  static async getAllUsers() {
    const result = await query(`SELECT id, name, phone, email, city, pincode, role, created_at FROM users ORDER BY created_at DESC`);
    return result.rows;
  }

  static async getUsersByCity(cityId) {
    const cityResult = await query('SELECT name FROM cities WHERE id = $1', [cityId]);
    const cityName = cityResult.rows[0]?.name || '';
    const result = await query(`SELECT * FROM users WHERE city = $1 ORDER BY created_at DESC`, [cityName]);
    return result.rows;
  }

  static async updateUserRole(id, role) {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    return true;
  }

  // ==========================================
  // 🏢 BUSINESS MANAGEMENT
  // ==========================================

  static async getAllBusinesses() {
    const result = await query(`
      SELECT b.id, b.title, b.address, b.phone, b.email, b.rating, b.status, b.created_at, c.name as category, ct.name as city
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    return result.rows;
  }

  static async getBusinessesByCity(cityId) {
    const result = await query(`
      SELECT b.*, c.name as category, ct.name as city_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      WHERE b.city_id = $1 ORDER BY b.created_at DESC
    `, [cityId]);
    return result.rows;
  }

  static async getPendingBusinesses() {
    const result = await query(`
      SELECT b.id, b.title, b.address, b.phone, b.email, b.submitted_at, cat.name as category, subcat.name as sub_category, u.name as submitted_by
      FROM businesses b
      LEFT JOIN categories subcat ON b.category_id = subcat.id
      LEFT JOIN categories cat ON subcat.parent_id = cat.id
      LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.status = 'pending' ORDER BY b.submitted_at ASC
    `);
    return result.rows;
  }

  static async getPendingBusinessesByCity(cityId) {
    const result = await query(`
      SELECT b.*, c.name as category, u.name as submitted_by
      FROM businesses b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.city_id = $1 AND b.status = 'pending' ORDER BY b.submitted_at ASC
    `, [cityId]);
    return result.rows;
  }

  static async directAddBusiness(data) {
    const { title, category_id, subcategory_id, address, phone, email, city_id, description, tag, rating, images } = data;
    const finalCategoryId = subcategory_id || category_id;
    
    const result = await query(`
      INSERT INTO businesses (title, category_id, address, phone, email, city_id, description, tag, rating, images, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP)
      RETURNING id, title, status
    `, [title, finalCategoryId, address, phone, email || null, city_id, description || null, tag || null, rating || 4.0, images || []]);
    return result.rows[0];
  }

  static async hardDeleteBusiness(id) {
    await query('DELETE FROM businesses WHERE id = $1', [id]);
    return true;
  }

  // ==========================================
  // ⭐ REVIEWS & FORMS
  // ==========================================

  static async getAllReviews() {
    const result = await query(`
      SELECT r.*, u.name as user_name, b.title as business_name
      FROM reviews r JOIN users u ON r.user_id = u.id JOIN businesses b ON r.business_id = b.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  static async getReviewsByCity(cityId) {
    const result = await query(`
      SELECT r.*, u.name as user_name, b.title as business_name
      FROM reviews r JOIN users u ON r.user_id = u.id JOIN businesses b ON r.business_id = b.id
      WHERE b.city_id = $1 ORDER BY r.created_at DESC
    `, [cityId]);
    return result.rows;
  }

  static async getFormData() {
    const categories = await query('SELECT * FROM categories WHERE level = 1 ORDER BY name');
    const subcategories = await query('SELECT * FROM categories WHERE level = 2 ORDER BY name');
    const cities = await query('SELECT * FROM cities ORDER BY name');
    return { categories: categories.rows, subcategories: subcategories.rows, cities: cities.rows };
  }
}

module.exports = Admin;