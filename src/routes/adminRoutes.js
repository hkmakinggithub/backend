const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ============================================
// TEST ROUTE
// ============================================
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin API is working!' });
});

// ============================================
// DASHBOARD
// ============================================
router.get('/dashboard', async (req, res) => {
  try {
    const result = await query(`
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
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USERS
// ============================================
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, phone, email, city, pincode, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CATEGORIES
// ============================================
router.get('/categories', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM categories WHERE level = 1 ORDER BY name`);
    res.json(result.rows);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const result = await query(`
      INSERT INTO categories (name, icon, description, level, is_active)
      VALUES ($1, $2, $3, 1, true)
      RETURNING *
    `, [name, icon, description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description } = req.body;
    await query(`UPDATE categories SET name = $1, icon = $2, description = $3 WHERE id = $4`, 
      [name, icon, description, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SUBCATEGORIES
// ============================================
router.get('/subcategories', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, parent.name as main_category 
      FROM categories c 
      JOIN categories parent ON parent.id = c.parent_id 
      WHERE c.level = 2 
      ORDER BY parent.name, c.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Subcategories error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/subcategories', async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    console.log('Creating subcategory:', { name, parent_id, description });
    
    const result = await query(`
      INSERT INTO categories (name, parent_id, description, level, is_active)
      VALUES ($1, $2, $3, 2, true)
      RETURNING *
    `, [name, parent_id, description]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, description } = req.body;
    await query(`
      UPDATE categories 
      SET name = $1, parent_id = $2, description = $3 
      WHERE id = $4 AND level = 2
    `, [name, parent_id, description, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM categories WHERE id = $1 AND level = 2', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUSINESSES
// ============================================
router.get('/businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        b.id, b.title, b.address, b.phone, b.email, b.rating, b.status,
        cat.name as category,
        subcat.name as sub_category,
        ct.name as city
      FROM businesses b
      LEFT JOIN categories subcat ON b.category_id = subcat.id
      LEFT JOIN categories cat ON subcat.parent_id = cat.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Businesses error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM businesses WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PENDING BUSINESSES
// ============================================
router.get('/pending-businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        b.id, b.title, b.address, b.phone, b.email, b.submitted_at,
        cat.name as category,
        subcat.name as sub_category,
        u.name as submitted_by
      FROM businesses b
      LEFT JOIN categories subcat ON b.category_id = subcat.id
      LEFT JOIN categories cat ON subcat.parent_id = cat.id
      LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.status = 'pending'
      ORDER BY b.submitted_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Pending businesses error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE businesses SET status = $1 WHERE id = $2', ['approved', id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await query('UPDATE businesses SET status = $1, rejection_reason = $2 WHERE id = $3', 
      ['rejected', reason || 'No reason provided', id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CITIES
// ============================================
router.get('/cities', async (req, res) => {
  try {
    const result = await query('SELECT * FROM cities ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Cities error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/cities', async (req, res) => {
  try {
    const { name, state } = req.body;
    const result = await query(`
      INSERT INTO cities (name, state, is_active)
      VALUES ($1, $2, true)
      RETURNING *
    `, [name, state]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body;
    await query('UPDATE cities SET name = $1, state = $2 WHERE id = $3', [name, state, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update city error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM cities WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete city error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REVIEWS
// ============================================
router.get('/reviews', async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as user_name, b.title as business_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN businesses b ON r.business_id = b.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Reviews error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BUSINESS CONTACT REQUESTS
// ============================================

// Create contact request table (Run in pgAdmin)
// CREATE TABLE IF NOT EXISTS business_contacts (
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     phone VARCHAR(20) NOT NULL,
//     email VARCHAR(100),
//     business_name VARCHAR(200),
//     business_type VARCHAR(100),
//     message TEXT,
//     status VARCHAR(20) DEFAULT 'pending',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// Submit contact request from client
router.post('/contact-business', async (req, res) => {
  try {
    const { name, phone, email, business_name, business_type, message } = req.body;
    
    const result = await query(`
      INSERT INTO business_contacts (name, phone, email, business_name, business_type, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `, [name, phone, email, business_name, business_type, message]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all contact requests (Admin)
router.get('/contact-requests', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM business_contacts 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update contact request status
router.put('/contact-requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE business_contacts SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ADMIN ADD BUSINESS DIRECTLY
// ============================================

// Get all categories and subcategories for dropdown
router.get('/business-form-data', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE level = 1 ORDER BY name');
    const subcategories = await query('SELECT * FROM categories WHERE level = 2 ORDER BY name');
    const cities = await query('SELECT * FROM cities ORDER BY name');
    
    res.json({
      categories: categories.rows,
      subcategories: subcategories.rows,
      cities: cities.rows
    });
  } catch (error) {
    console.error('Get form data error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin add business directly
// Admin add business directly (auto-approved)



// ============================================
// ADMIN ADD BUSINESS WITH IMAGES
// ============================================
// ============================================
// ADMIN ADD BUSINESS DIRECTLY
// ============================================


// Get all businesses
router.get('/businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.address, 
        b.phone, 
        b.email, 
        b.rating, 
        b.status,
        b.created_at,
        c.name as category,
        ct.name as city
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    
    console.log(`Found ${result.rows.length} businesses`);
    res.json(result.rows);
  } catch (error) {
    console.error('Businesses error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve business
router.put('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update business status to approved
    const result = await query(
      'UPDATE businesses SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      ['approved', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    console.log(`Business ${id} approved successfully`);
    res.json({ success: true, message: 'Business approved successfully' });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: error.message });
  }
});


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});
// Admin add business - goes to PENDING first
// Admin add business - goes to PENDING first
// Admin add business
// Admin add business with images
router.post('/add-business', async (req, res) => {
  try {
    const { 
      title, 
      category_id, 
      subcategory_id, 
      address, 
      phone, 
      email, 
      city_id, 
      description, 
      tag,
      rating,
      images 
    } = req.body;
    
    console.log('Adding business with', images?.length || 0, 'images');
    
    // Validate
    if (!title || !address || !phone || !city_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const finalCategoryId = subcategory_id || category_id;
    
    const result = await query(`
      INSERT INTO businesses (
        title, category_id, address, phone, email, city_id, description, tag, rating, images, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP)
      RETURNING id, title, status
    `, [
      title, finalCategoryId, address, phone, email || null, city_id, 
      description || null, tag || null, rating || 4.0, images || []
    ]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Business added with images',
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Add business error:', error);
    res.status(500).json({ error: error.message });
  }
});




// Get all businesses (approved and pending)
router.get('/businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        b.id, 
        b.title, 
        b.address, 
        b.phone, 
        b.email, 
        b.rating, 
        b.status,
        b.created_at,
        c.name as category,
        ct.name as city
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    
    console.log(`Found ${result.rows.length} businesses`);
    res.json(result.rows);
  } catch (error) {
    console.error('Businesses error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Dashboard by city
router.get('/dashboard/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    
    const result = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM businesses WHERE city_id = $1 AND status = 'approved') as total_businesses,
        (SELECT COUNT(*) FROM businesses WHERE city_id = $1 AND status = 'pending') as pending_businesses,
        (SELECT COUNT(*) FROM businesses WHERE city_id = $1 AND status = 'rejected') as rejected_businesses,
        (SELECT COUNT(*) FROM categories WHERE level = 1) as total_categories,
        (SELECT COUNT(*) FROM categories WHERE level = 2) as total_subcategories,
        (SELECT COUNT(*) FROM reviews r JOIN businesses b ON r.business_id = b.id WHERE b.city_id = $1) as total_reviews,
        (SELECT COALESCE(ROUND(AVG(r.rating), 1), 0) FROM reviews r JOIN businesses b ON r.business_id = b.id WHERE b.city_id = $1) as avg_rating,
        (SELECT COUNT(*) FROM businesses WHERE city_id = $1 AND status = 'approved') as approved_businesses
    `, [cityId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Dashboard by city error:', error);
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;