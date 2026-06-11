// const express = require('express');
// const router = express.Router();
// const { query } = require('../config/database');


// router.get('/', async (req, res) => {
//   try {
//     const result = await query('SELECT * FROM cities WHERE is_active = true ORDER BY name');
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error('Get cities error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch cities' });
//   }
// });


// // Get businesses by city
// router.get('/:cityId/businesses', async (req, res) => {
//   try {
//     const { cityId } = req.params;
//     const sql = `
//       SELECT b.*, c.name as category_name
//       FROM businesses b
//       LEFT JOIN categories c ON b.category_id = c.id
//       WHERE b.city_id = $1 AND b.status = 'approved'
//       ORDER BY b.created_at DESC
//     `;
//     const result = await query(sql, [cityId]);
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error('Get businesses by city error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch businesses' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();

const cityController = require('../controllers/cityController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================

// Get all active cities
router.get('/', cityController.getCities);

// Get all approved businesses inside a specific city
router.get('/:cityId/businesses', cityController.getCityBusinesses);

// ==========================================
// 🔒 ADMIN ROUTES
// ==========================================

// Add a new city
router.post('/', protect, adminOnly, cityController.createCity);

// Deactivate a city (Soft Delete)
router.delete('/:id', protect, adminOnly, cityController.deactivateCity);

module.exports = router;