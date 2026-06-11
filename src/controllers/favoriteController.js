// const { query } = require('../config/database');

// // Get user's favorites
// const getFavorites = async (req, res) => {
//   try {
//     const userId = req.user.id;
    
//     const sql = `
//       SELECT b.*, f.created_at as favorited_at
//       FROM favorites f
//       JOIN businesses b ON f.business_id = b.id
//       WHERE f.user_id = $1 AND b.status = 'approved'
//       ORDER BY f.created_at DESC
//     `;
    
//     const result = await query(sql, [userId]);
    
//     res.json({
//       success: true,
//       data: result.rows
//     });
//   } catch (error) {
//     console.error('Get favorites error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch favorites'
//     });
//   }
// };

// // Add to favorites
// const addFavorite = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { business_id } = req.body;
    
//     if (!business_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'Business ID is required'
//       });
//     }
    
//     // Check if already exists
//     const checkSql = 'SELECT id FROM favorites WHERE user_id = $1 AND business_id = $2';
//     const checkResult = await query(checkSql, [userId, business_id]);
    
//     if (checkResult.rows.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Already in favorites'
//       });
//     }
    
//     const sql = `
//       INSERT INTO favorites (user_id, business_id)
//       VALUES ($1, $2)
//       RETURNING id
//     `;
    
//     await query(sql, [userId, business_id]);
    
//     res.json({
//       success: true,
//       message: 'Added to favorites'
//     });
//   } catch (error) {
//     console.error('Add favorite error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to add favorite'
//     });
//   }
// };

// // Remove from favorites
// const removeFavorite = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { businessId } = req.params;
    
//     const sql = 'DELETE FROM favorites WHERE user_id = $1 AND business_id = $2';
//     await query(sql, [userId, businessId]);
    
//     res.json({
//       success: true,
//       message: 'Removed from favorites'
//     });
//   } catch (error) {
//     console.error('Remove favorite error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to remove favorite'
//     });
//   }
// };

// // Check if business is favorite
// const checkFavorite = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { businessId } = req.params;
    
//     const sql = 'SELECT id FROM favorites WHERE user_id = $1 AND business_id = $2';
//     const result = await query(sql, [userId, businessId]);
    
//     res.json({
//       success: true,
//       isFavorite: result.rows.length > 0
//     });
//   } catch (error) {
//     console.error('Check favorite error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to check favorite'
//     });
//   }
// };

// module.exports = {
//   getFavorites,
//   addFavorite,
//   removeFavorite,
//   checkFavorite
// };

const Favorite = require('../models/Favorite');

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.getUserFavorites(userId);
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch favorites' });
  }
};

// Add to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { business_id } = req.body;
    
    if (!business_id) {
      return res.status(400).json({ success: false, message: 'Business ID is required' });
    }
    
    const result = await Favorite.add(userId, business_id);
    
    if (result.alreadyExists) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }
    
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to add favorite' });
  }
};

// Remove from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    
    await Favorite.remove(userId, businessId);
    
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove favorite' });
  }
};

// Check if business is favorite
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    
    const isFavorite = await Favorite.check(userId, businessId);
    
    res.json({ success: true, isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ success: false, message: 'Failed to check favorite status' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
};