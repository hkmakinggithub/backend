// const express = require('express');

// const router = express.Router();

// const { query } = require('../config/database'); 


// router.get('/', async (req, res) => {
//   try {
//     const result = await query('SELECT * FROM categories WHERE level = 1 AND is_active = true ORDER BY name');
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error('Get categories error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch categories' });
//   }
// }); 


// // Get sub-categories by parent ID
// router.get('/:parentId/subcategories', async (req, res) => {
//   try {
//     const { parentId } = req.params;
   
    
//     const result = await query(
//       'SELECT * FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY name',
//       [parentId]
//     );
    
   
//     res.json({ success: true, data: result.rows });
//   } catch (error) {
//     console.error('Get subcategories error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
//   }
// });


// // Get category by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
//     res.json({ success: true, data: result.rows[0] || null });
//   } catch (error) {
//     console.error('Get category error:', error);
//     res.status(500).json({ success: false, message: 'Failed to fetch category' });
//   }
// });

const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
// const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// 🔓 PUBLIC READ ROUTES
// ==========================================

// Get top-level main categories (replaces your direct database level=1 call)
router.get('/', categoryController.getMainCategories);

// Get all flat categories unconditionally
router.get('/all', categoryController.getCategories);

// Get sub-categories belonging to a parent category
router.get('/:parentId/subcategories', categoryController.getSubCategories);

// ==========================================
// 🔓 ADMIN MUTATION ROUTES (Security Temporarily Disabled for Dev)
// ==========================================

// Notice how we use '/' instead of '/categories' here!
router.post('/', categoryController.createCategory);

// Notice how we use '/:id' instead of '/categories/:id' here!
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// ==========================================
// ⚠️ THE WILDCARD ROUTE (Must ALWAYS be at the very bottom)
// ==========================================
// Get single category profile by ID 
router.get('/:id', categoryController.getCategory);


module.exports = router;