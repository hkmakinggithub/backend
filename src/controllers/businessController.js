


const { query } = require('../config/database');
const Business = require('../models/Business');
// Get businesses by category
// Get businesses by category (with city filter)
// Get businesses by category (with optional city filter)






// Get businesses by category (with optional city filter)
const getBusinessesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { cityId } = req.query;
    
    console.log('Fetching businesses - Category:', categoryId, 'City:', cityId);
    
    // First, check if this category has sub-categories
    const subCheck = await query(
      'SELECT id FROM categories WHERE parent_id = $1 AND is_active = true',
      [categoryId]
    );
    
    let sql;
    let params;
    
    // If category has sub-categories, get all businesses from sub-categories
    if (subCheck.rows.length > 0) {
      console.log('Category has sub-categories, fetching all from sub-categories');
      sql = `
        SELECT b.*, c.name as category_name
        FROM businesses b
        JOIN categories c ON b.category_id = c.id
        WHERE c.parent_id = $1 AND b.status = 'approved'
      `;
      params = [categoryId];
    } else {
      // No sub-categories, get businesses directly from this category
      sql = `
        SELECT b.*, c.name as category_name
        FROM businesses b
        JOIN categories c ON b.category_id = c.id
        WHERE b.category_id = $1 AND b.status = 'approved'
      `;
      params = [categoryId];
    }
    
    // Add city filter if provided
    if (cityId && cityId !== 'null' && cityId !== 'undefined') {
      sql += ` AND b.city_id = $${params.length + 1}`;
      params.push(cityId);
      console.log('Filtering by city:', cityId);
    }
    
    sql += ` ORDER BY b.rating DESC`;
    
    const result = await query(sql, params);
    
    console.log(`Found ${result.rows.length} businesses`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses'
    });
  }
};

const getBusinessesByMainCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { cityId } = req.query;
    
    console.log('Fetching all businesses for main category:', categoryId);
    
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      JOIN categories c ON b.category_id = c.id
      WHERE (c.id = $1 OR c.parent_id = $1) AND b.status = 'approved'
    `;
    let params = [categoryId];
    
    if (cityId && cityId !== 'null' && cityId !== 'undefined') {
      sql += ` AND b.city_id = $2`;
      params.push(cityId);
    }
    
    sql += ` ORDER BY b.rating DESC`;
    
    const result = await query(sql, params);
    
    console.log(`Found ${result.rows.length} businesses for main category`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get businesses by main category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses'
    });
  }
};
// Get all businesses
const getAllBusinesses = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM businesses 
      WHERE status = 'approved'
      ORDER BY created_at DESC
    `;
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses'
    });
  }
};

// Get single business
// Get single business
const getBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business ID'
      });
    }
    
    const sql = 'SELECT * FROM businesses WHERE id = $1';
    const result = await query(sql, [id]);
    
    if (!result.rows[0]) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business'
    });
  }
};
// Search businesses
const searchBusinesses = async (req, res) => {
  try {
    const { q, category, sortBy, order, minRating, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'approved'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (q && q.trim()) {
      sql += ` AND (b.title ILIKE $${paramIndex} OR b.address ILIKE $${paramIndex})`;
      params.push(`%${q.trim()}%`);
      paramIndex++;
    }
    
    if (category && category !== 'all' && category !== 'undefined') {
      sql += ` AND b.category_id = $${paramIndex}`;
      params.push(parseInt(category));
      paramIndex++;
    }
    
    if (minRating && parseFloat(minRating) > 0) {
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
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Search businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search businesses'
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const sql = `
      SELECT DISTINCT id, title, address
      FROM businesses
      WHERE status = 'approved'
      AND (title ILIKE $1 OR address ILIKE $1)
      LIMIT 10
    `;
    
    const result = await query(sql, [`%${q.trim()}%`]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

// ==================== NEW FUNCTIONS FOR SUBMIT BUSINESS ====================

// User submits a new business
const submitBusiness = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category_id, title, address, phone, email, tag, description, images } = req.body;
    
    console.log('Submitting business:', { userId, category_id, title, address });
    
    // Validation
    if (!category_id || !title || !address) {
      return res.status(400).json({
        success: false,
        message: 'Category, title and address are required'
      });
    }
    
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
    
    res.status(201).json({
      success: true,
      message: 'Business submitted for approval',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit business: ' + error.message
    });
  }
};

// Get user's submitted businesses
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sql = `
      SELECT b.*, c.name as category_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.submitted_by = $1
      ORDER BY b.submitted_at DESC
    `;
    const result = await query(sql, [userId]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your submissions'
    });
  }
};

// Admin: Get pending businesses
const getPendingBusinesses = async (req, res) => {
  try {
    const sql = `
      SELECT b.*, c.name as category_name, u.name as submitter_name, u.phone as submitter_phone
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.status = 'pending'
      ORDER BY b.submitted_at ASC
    `;
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get pending businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending businesses'
    });
  }
};

// Admin: Approve business
const approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const adminId = req.user.id;
    
    const sql = `
      UPDATE businesses 
      SET status = 'approved', 
          approved_by = $1, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await query(sql, [adminId, businessId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Business approved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Approve business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve business'
    });
  }
};

// Admin: Reject business
const rejectBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    const sql = `
      UPDATE businesses 
      SET status = 'rejected', 
          rejection_reason = $1,
          approved_by = $2, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [reason || 'No reason provided', adminId, businessId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Business rejected',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Reject business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject business'
    });
  }
};
// Get nearby businesses
// Get nearby businesses
// Get nearby businesses
// Get nearby businesses (Simpler version)
const getNearbyBusinesses = async (req, res) => {
  try {
    const { lat, lng, radius = 5, limit = 20 } = req.query;
    
    console.log('Getting nearby businesses:', { lat, lng, radius });
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Simpler version using subquery
    const sql = `
      SELECT * FROM (
        SELECT *,
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          ) AS distance
        FROM businesses
        WHERE status = 'approved'
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
      ) AS subquery
      WHERE distance < $3
      ORDER BY distance
      LIMIT $4
    `;
    
    const result = await query(sql, [parseFloat(lat), parseFloat(lng), parseFloat(radius), parseInt(limit)]);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get nearby businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby businesses: ' + error.message
    });
  }
};
// Update business location (admin only)
const updateBusinessLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    console.log('Updating business location:', { id, latitude, longitude });
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const sql = `
      UPDATE businesses 
      SET latitude = $1, longitude = $2
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [latitude, longitude, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location: ' + error.message
    });
  }
};

// Track business view
const trackBusinessView = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Update analytics
    const sql = `
      INSERT INTO business_analytics (business_id, views, last_updated)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (business_id) 
      DO UPDATE SET views = business_analytics.views + 1, last_updated = CURRENT_TIMESTAMP
    `;
    await query(sql, [businessId]);
    
    // Update daily stats
    const dailySql = `
      INSERT INTO business_daily_stats (business_id, date, views)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (business_id, date) 
      DO UPDATE SET views = business_daily_stats.views + 1
    `;
    await query(dailySql, [businessId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ success: false });
  }
};

// Track business click (call, direction, share, whatsapp)
const trackBusinessClick = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { type } = req.body; // 'call', 'direction', 'share', 'whatsapp'
    
    let column = '';
    switch(type) {
      case 'call': column = 'call_clicks'; break;
      case 'direction': column = 'direction_clicks'; break;
      case 'share': column = 'shares'; break;
      case 'whatsapp': column = 'whatsapp_clicks'; break;
      default: column = 'clicks';
    }
    
    const sql = `
      INSERT INTO business_analytics (business_id, ${column}, last_updated)
      VALUES ($1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (business_id) 
      DO UPDATE SET ${column} = business_analytics.${column} + 1, last_updated = CURRENT_TIMESTAMP
    `;
    await query(sql, [businessId]);
    
    // Update daily stats
    const dailySql = `
      INSERT INTO business_daily_stats (business_id, date, clicks)
      VALUES ($1, CURRENT_DATE, 1)
      ON CONFLICT (business_id, date) 
      DO UPDATE SET clicks = business_daily_stats.clicks + 1
    `;
    await query(dailySql, [businessId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ success: false });
  }
};

// Get business analytics (Admin only)
const getBusinessAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const sql = `
      SELECT * FROM business_analytics WHERE business_id = $1
    `;
    const result = await query(sql, [businessId]);
    
    // Get last 7 days stats
    const dailySql = `
      SELECT date, views, clicks
      FROM business_daily_stats
      WHERE business_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC
    `;
    const dailyResult = await query(dailySql, [businessId]);
    
    res.json({
      success: true,
      data: result.rows[0] || { views: 0, clicks: 0, shares: 0 },
      daily: dailyResult.rows
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false });
  }
};

// Get popular businesses (Top 10)
const getPopularBusinesses = async (req, res) => {
  try {
    const sql = `
      SELECT b.*, a.views, a.clicks, a.shares
      FROM businesses b
      JOIN business_analytics a ON b.id = a.business_id
      WHERE b.status = 'approved'
      ORDER BY a.views DESC
      LIMIT 10
    `;
    const result = await query(sql);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get popular businesses error:', error);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getBusinessesByCategory,
  getAllBusinesses,
  getBusiness,
  searchBusinesses,
  getSearchSuggestions,
  submitBusiness,
  getUserSubmissions,
  getPendingBusinesses,
  approveBusiness,
  rejectBusiness,
  getNearbyBusinesses,
  updateBusinessLocation,
  trackBusinessView,        // Add this
  trackBusinessClick,       // Add this
  getBusinessAnalytics,     // Add this
  getPopularBusinesses,      // Add this
  getBusinessesByMainCategory  // Add this line
};