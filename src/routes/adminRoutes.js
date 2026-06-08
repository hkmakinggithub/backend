
const express = require('express');

const router = express.Router();

const { query } = require('../config/database');




router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin API is working perfectly!' });
});



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




router.get('/dashboard/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    if (!cityId || isNaN(cityId)) return res.status(400).json({ error: 'Invalid city ID' });
    
    const cityCheck = await query('SELECT id, name FROM cities WHERE id = $1', [cityId]);
    if (cityCheck.rows.length === 0) return res.status(404).json({ error: 'City not found' });
    
    const cityName = cityCheck.rows[0].name;
    
    const businessesResult = await query(`SELECT COUNT(*) as count FROM businesses WHERE city_id = $1 AND status = 'approved'`, [cityId]);
    const pendingResult = await query(`SELECT COUNT(*) as count FROM businesses WHERE city_id = $1 AND status = 'pending'`, [cityId]);
    const usersResult = await query('SELECT COUNT(*) as count FROM users'); // Global Users
    const categoriesResult = await query('SELECT COUNT(*) as count FROM categories WHERE level = 1');
    const reviewsResult = await query(`
      SELECT COUNT(r.id) as total_reviews, COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
      FROM reviews r JOIN businesses b ON r.business_id = b.id WHERE b.city_id = $1
    `, [cityId]);
    
    res.json({
      total_users: parseInt(usersResult.rows[0]?.count || 0),
      total_businesses: parseInt(businessesResult.rows[0]?.count || 0),
      pending_businesses: parseInt(pendingResult.rows[0]?.count || 0),
      total_categories: parseInt(categoriesResult.rows[0]?.count || 0),
      total_reviews: parseInt(reviewsResult.rows[0]?.total_reviews || 0),
      avg_rating: parseFloat(reviewsResult.rows[0]?.avg_rating || 0),
      city_name: cityName
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});





// 1. Get ALL Users
router.get('/users', async (req, res) => {
  try {
    const result = await query(`SELECT id, name, phone, email, city, pincode, role, created_at FROM users ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/users/city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const cityResult = await query('SELECT name FROM cities WHERE id = $1', [cityId]);
    const cityName = cityResult.rows[0]?.name || '';
    
    const result = await query(`SELECT * FROM users WHERE city = $1 ORDER BY created_at DESC`, [cityName]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// 3. Get SINGLE User by ID (For your React Modal Drawer)
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`SELECT id, name, phone, email, city, pincode, role, profile_image, created_at FROM users WHERE id = $1`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Wrapped in { success, data } format specifically for your React frontend configuration
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// 4. Update User Role
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






// 5. Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/cities', async (req, res) => {
  try {
    const result = await query('SELECT id, name FROM cities WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.post('/cities', async (req, res) => {
  try {
    const { name, state } = req.body;
    const result = await query(`INSERT INTO cities (name, state, is_active) VALUES ($1, $2, true) RETURNING *`, [name, state]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});




router.delete('/cities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM cities WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/categories', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM categories WHERE level = 1 ORDER BY name`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.post('/categories', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const result = await query(`INSERT INTO categories (name, icon, description, level, is_active) VALUES ($1, $2, $3, 1, true) RETURNING *`, [name, icon, description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/subcategories', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, parent.name as main_category 
      FROM categories c JOIN categories parent ON parent.id = c.parent_id 
      WHERE c.level = 2 ORDER BY parent.name, c.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.post('/subcategories', async (req, res) => {
  try {
    const { name, parent_id, description } = req.body;
    const result = await query(`INSERT INTO categories (name, parent_id, description, level, is_active) VALUES ($1, $2, $3, 2, true) RETURNING *`, [name, parent_id, description]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






router.get('/businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT b.id, b.title, b.address, b.phone, b.email, b.rating, b.status, b.created_at, c.name as category, ct.name as city
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/businesses/city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const result = await query(`
      SELECT b.*, c.name as category, ct.name as city_name
      FROM businesses b
      LEFT JOIN categories c ON b.category_id = c.id
      LEFT JOIN cities ct ON b.city_id = ct.id
      WHERE b.city_id = $1 ORDER BY b.created_at DESC
    `, [cityId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.post('/add-business', async (req, res) => {
  try {
    const { title, category_id, subcategory_id, address, phone, email, city_id, description, tag, rating, images } = req.body;
    if (!title || !address || !phone || !city_id) return res.status(400).json({ error: 'Missing required fields' });
    
    const finalCategoryId = subcategory_id || category_id;
    const result = await query(`
      INSERT INTO businesses (title, category_id, address, phone, email, city_id, description, tag, rating, images, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', CURRENT_TIMESTAMP)
      RETURNING id, title, status
    `, [title, finalCategoryId, address, phone, email || null, city_id, description || null, tag || null, rating || 4.0, images || []]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.delete('/businesses/:id', async (req, res) => {
  try {
    await query('DELETE FROM businesses WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






router.get('/pending-businesses', async (req, res) => {
  try {
    const result = await query(`
      SELECT b.id, b.title, b.address, b.phone, b.email, b.submitted_at, cat.name as category, subcat.name as sub_category, u.name as submitted_by
      FROM businesses b
      LEFT JOIN categories subcat ON b.category_id = subcat.id
      LEFT JOIN categories cat ON subcat.parent_id = cat.id
      LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.status = 'pending' ORDER BY b.submitted_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/pending-businesses/city/:cityId', async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*, c.name as category, u.name as submitted_by
      FROM businesses b LEFT JOIN categories c ON b.category_id = c.id LEFT JOIN users u ON b.submitted_by = u.id
      WHERE b.city_id = $1 AND b.status = 'pending' ORDER BY b.submitted_at ASC
    `, [req.params.cityId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.put('/approve/:id', async (req, res) => {
  try {
    await query('UPDATE businesses SET status = $1, approved_at = CURRENT_TIMESTAMP WHERE id = $2', ['approved', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.put('/reject/:id', async (req, res) => {
  try {
    await query('UPDATE businesses SET status = $1, rejection_reason = $2 WHERE id = $3', ['rejected', req.body.reason || 'No reason provided', req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/reviews', async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as user_name, b.title as business_name
      FROM reviews r JOIN users u ON r.user_id = u.id JOIN businesses b ON r.business_id = b.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/reviews/city/:cityId', async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as user_name, b.title as business_name
      FROM reviews r JOIN users u ON r.user_id = u.id JOIN businesses b ON r.business_id = b.id
      WHERE b.city_id = $1 ORDER BY r.created_at DESC
    `, [req.params.cityId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.delete('/reviews/:id', async (req, res) => {
  try {
    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




router.get('/business-form-data', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories WHERE level = 1 ORDER BY name');
    const subcategories = await query('SELECT * FROM categories WHERE level = 2 ORDER BY name');
    const cities = await query('SELECT * FROM cities ORDER BY name');
    res.json({ categories: categories.rows, subcategories: subcategories.rows, cities: cities.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;