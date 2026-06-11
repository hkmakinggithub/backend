const { query } = require('../config/database');

const safeParse = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  try { return JSON.parse(data); } catch (e) { return {}; }
};

class News {
  // 1. Get ONLY active news (For the Mobile App) - WITH PAGINATION
  static async getActive(cityId, limit, offset) {
    let sql;
    const params = [];
    
    if (cityId && cityId !== 'All') {
      sql = `SELECT * FROM local_news WHERE is_active = true AND city_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(cityId, limit, offset);
    } else {
      sql = `SELECT * FROM local_news WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await query(sql, params);
    
    return result.rows.map(item => ({
      ...item,
      title: safeParse(item.title),
      description: safeParse(item.description)
    }));
  }

  // 2. Get ALL news (For the Admin Panel)
  static async getAll() {
    const sql = `SELECT * FROM local_news ORDER BY created_at DESC`;
    const result = await query(sql);
    
    return result.rows.map(item => ({
      ...item,
      title: safeParse(item.title),
      description: safeParse(item.description)
    }));
  }

  // 3. Create News
  static async create(newsData) {
    const { city_id, news_type, title, description } = newsData;
    
    const titleJson = JSON.stringify(title || {});
    const descJson = JSON.stringify(description || {});
    
    const sql = `
      INSERT INTO local_news (city_id, news_type, title, description, is_active)
      VALUES ($1, $2, $3, $4, true) RETURNING *
    `;
    const result = await query(sql, [city_id, news_type, titleJson, descJson]);
    
    const newNews = result.rows[0];
    return {
      ...newNews,
      title: safeParse(newNews.title),
      description: safeParse(newNews.description)
    };
  }

  // 4. Update News
  static async update(id, newsData) {
    const { city_id, news_type, title, description } = newsData;
    
    const titleJson = JSON.stringify(title || {});
    const descJson = JSON.stringify(description || {});
    
    const sql = `
      UPDATE local_news 
      SET city_id = $1, news_type = $2, title = $3, description = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *
    `;
    const result = await query(sql, [city_id, news_type, titleJson, descJson, id]);
    
    if (result.rows.length === 0) return null;
    
    const updatedNews = result.rows[0];
    return {
      ...updatedNews,
      title: safeParse(updatedNews.title),
      description: safeParse(updatedNews.description)
    };
  }

  // 5. Delete News
  static async delete(id) {
    const sql = `DELETE FROM local_news WHERE id = $1 RETURNING id`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // 6. Toggle Active Status
  static async toggleStatus(id) {
    const sql = `UPDATE local_news SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING is_active`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = News;