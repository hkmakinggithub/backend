// const { query } = require('../config/database');

// // --- HELPER FUNCTION: Safe JSON Parser ---
// // This stops the React frontend from crashing if the database sends bad text
// const safeParse = (data) => {
//   if (!data) return {};
//   if (typeof data === 'object') return data;
//   try { return JSON.parse(data); } catch (e) { return {}; }
// };

// // 1. Get ONLY active news (For the Mobile App)
// const getActiveNews = async (req, res) => {
//   try {
//     const { cityId } = req.query;
//     let sql = `SELECT * FROM local_news WHERE is_active = true`;
//     const params = [];
    
//     if (cityId && cityId !== 'All') {
//       sql += ` AND city_id = $1`;
//       params.push(cityId);
//     }
//     sql += ` ORDER BY created_at DESC LIMIT 10`;
    
//     const result = await query(sql, params);
    
//     // Safely parse JSON before sending to frontend
//     const safeData = result.rows.map(item => ({
//       ...item,
//       title: safeParse(item.title),
//       description: safeParse(item.description)
//     }));
    
//     res.json({ success: true, data: safeData });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 2. Get ALL news (For the Admin Panel)
// const getAllNews = async (req, res) => {
//   try {
//     const sql = `SELECT * FROM local_news ORDER BY created_at DESC`;
//     const result = await query(sql);
    
//     // Safely parse JSON before sending to React Dashboard
//     const safeData = result.rows.map(item => ({
//       ...item,
//       title: safeParse(item.title),
//       description: safeParse(item.description)
//     }));
    
//     res.json({ success: true, data: safeData });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 3. Create News
// const addNews = async (req, res) => {
//   try {
//     const { city_id, news_type, title, description } = req.body;
    
//     // Safely turn Javascript objects into Database Strings
//     const titleJson = JSON.stringify(title || {});
//     const descJson = JSON.stringify(description || {});
    
//     const sql = `
//       INSERT INTO local_news (city_id, news_type, title, description, is_active)
//       VALUES ($1, $2, $3, $4, true) RETURNING *
//     `;
//     const result = await query(sql, [city_id, news_type, titleJson, descJson]);
    
//     res.status(201).json({ success: true, data: result.rows[0] });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 4. Update News
// const updateNews = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { city_id, news_type, title, description } = req.body;
    
//     // Safely turn Javascript objects into Database Strings
//     const titleJson = JSON.stringify(title || {});
//     const descJson = JSON.stringify(description || {});
    
//     const sql = `
//       UPDATE local_news 
//       SET city_id = $1, news_type = $2, title = $3, description = $4
//       WHERE id = $5 RETURNING *
//     `;
//     const result = await query(sql, [city_id, news_type, titleJson, descJson, id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'News not found' });
//     }
    
//     res.json({ success: true, data: result.rows[0] });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 5. Delete News
// const deleteNews = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const result = await query(`DELETE FROM local_news WHERE id = $1 RETURNING id`, [id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'News not found' });
//     }
    
//     res.json({ success: true, message: 'News deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // 6. Toggle Active Status
// const toggleActiveStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const sql = `UPDATE local_news SET is_active = NOT is_active WHERE id = $1 RETURNING is_active`;
//     const result = await query(sql, [id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ success: false, message: 'News not found' });
//     }
    
//     res.json({ success: true, is_active: result.rows[0].is_active });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { getActiveNews, getAllNews, addNews, updateNews, deleteNews, toggleActiveStatus };



const { query } = require('../config/database');

// --- HELPER FUNCTION: Safe JSON Parser ---
// Protects React/React Native frontends from crashing on bad text
const safeParse = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch (e) { return {}; }
};

// 1. Get ONLY active news (For the Mobile App) - WITH PAGINATION
const getActiveNews = async (req, res) => {
  try {
    const { cityId } = req.query;
    // Set up pagination for mobile "Load More" features
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    let sql;
    const params = [];
    
    // Safely handle dynamic PostgreSQL parameter numbering ($1, $2, etc.)
    if (cityId && cityId !== 'All') {
      sql = `SELECT * FROM local_news WHERE is_active = true AND city_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(cityId, limit, offset);
    } else {
      sql = `SELECT * FROM local_news WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await query(sql, params);
    
    const safeData = result.rows.map(item => ({
      ...item,
      title: safeParse(item.title),
      description: safeParse(item.description)
    }));
    
    res.json({ success: true, data: safeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get ALL news (For the Admin Panel)
const getAllNews = async (req, res) => {
  try {
    const sql = `SELECT * FROM local_news ORDER BY created_at DESC`;
    const result = await query(sql);
    
    const safeData = result.rows.map(item => ({
      ...item,
      title: safeParse(item.title),
      description: safeParse(item.description)
    }));
    
    res.json({ success: true, data: safeData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create News
const addNews = async (req, res) => {
  try {
    const { city_id, news_type, title, description } = req.body;
    
    // Input Validation to prevent 500 Server Errors
    if (!city_id || !news_type || !title || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Safely turn Javascript objects into Database Strings
    const titleJson = JSON.stringify(title || {});
    const descJson = JSON.stringify(description || {});
    
    const sql = `
      INSERT INTO local_news (city_id, news_type, title, description, is_active)
      VALUES ($1, $2, $3, $4, true) RETURNING *
    `;
    const result = await query(sql, [city_id, news_type, titleJson, descJson]);
    
    // Parse the returned data so the frontend receives objects immediately, not strings
    const newNews = result.rows[0];
    res.status(201).json({ 
      success: true, 
      data: {
        ...newNews,
        title: safeParse(newNews.title),
        description: safeParse(newNews.description)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update News
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { city_id, news_type, title, description } = req.body;
    
    if (!city_id || !news_type || !title || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const titleJson = JSON.stringify(title || {});
    const descJson = JSON.stringify(description || {});
    
    const sql = `
      UPDATE local_news 
      SET city_id = $1, news_type = $2, title = $3, description = $4
      WHERE id = $5 RETURNING *
    `;
    const result = await query(sql, [city_id, news_type, titleJson, descJson, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    // Parse the returned data for the frontend
    const updatedNews = result.rows[0];
    res.json({ 
      success: true, 
      data: {
        ...updatedNews,
        title: safeParse(updatedNews.title),
        description: safeParse(updatedNews.description)
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Delete News
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`DELETE FROM local_news WHERE id = $1 RETURNING id`, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Toggle Active Status
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `UPDATE local_news SET is_active = NOT is_active WHERE id = $1 RETURNING is_active`;
    const result = await query(sql, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }
    
    res.json({ success: true, is_active: result.rows[0].is_active });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getActiveNews, getAllNews, addNews, updateNews, deleteNews, toggleActiveStatus };