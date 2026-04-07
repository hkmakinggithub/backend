const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads/ads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Get all ads (admin)
router.get('/ads', async (req, res) => {
  try {
    const result = await query('SELECT * FROM advertisements ORDER BY display_order ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active ads for app
router.get('/ads/active', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await query(`
      SELECT * FROM advertisements 
      WHERE is_active = true 
      AND (start_date IS NULL OR start_date <= $1)
      AND (end_date IS NULL OR end_date >= $1)
      ORDER BY display_order ASC
    `, [today]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get active ads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new ad
router.post('/ads', upload.single('media'), async (req, res) => {
  try {
    const { type, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active } = req.body;
    
    let media_url = null;
    if (req.file) {
      media_url = `/uploads/ads/${req.file.filename}`;
    }
    
    const result = await query(`
      INSERT INTO advertisements (type, media_url, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [type, media_url, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active === 'true']);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add ad error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ad
router.put('/ads/:id', upload.single('media'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active } = req.body;
    
    let media_url = null;
    if (req.file) {
      media_url = `/uploads/ads/${req.file.filename}`;
    }
    
    let queryStr = `
      UPDATE advertisements SET 
        type = $1,
        title = $2,
        description = $3,
        click_url = $4,
        duration = $5,
        display_order = $6,
        start_date = $7,
        end_date = $8,
        frequency = $9,
        is_active = $10,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    let params = [type, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active === 'true'];
    
    if (media_url) {
      queryStr = `
        UPDATE advertisements SET 
          type = $1,
          media_url = $2,
          title = $3,
          description = $4,
          click_url = $5,
          duration = $6,
          display_order = $7,
          start_date = $8,
          end_date = $9,
          frequency = $10,
          is_active = $11,
          updated_at = CURRENT_TIMESTAMP
      `;
      params = [type, media_url, title, description, click_url, duration, display_order, start_date, end_date, frequency, is_active === 'true'];
    }
    
    queryStr += ` WHERE id = $${params.length + 1}`;
    params.push(id);
    
    await query(queryStr, params);
    res.json({ success: true, message: 'Ad updated successfully' });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ad
router.delete('/ads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM advertisements WHERE id = $1', [id]);
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track impression
router.post('/ads/:id/track-impression', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE advertisements SET impressions = impressions + 1 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track click
router.post('/ads/:id/track-click', async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE advertisements SET clicks = clicks + 1 WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;