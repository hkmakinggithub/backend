const express = require('express');

const router = express.Router();

const { query } = require('../config/database'); 


router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories WHERE level = 1 AND is_active = true ORDER BY name');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
}); 


// Get sub-categories by parent ID
router.get('/:parentId/subcategories', async (req, res) => {
  try {
    const { parentId } = req.params;
   
    
    const result = await query(
      'SELECT * FROM categories WHERE parent_id = $1 AND is_active = true ORDER BY name',
      [parentId]
    );
    
   
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
  }
});


// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM categories WHERE id = $1', [id]);
    res.json({ success: true, data: result.rows[0] || null });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});


module.exports = router;