const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const crypto = require('crypto');

// Verify Clerk webhook signature
const verifyWebhook = (req) => {
  const secret = process.env.CLERK_SECRET_KEY;
  const signature = req.headers['svix-signature'];
  const timestamp = req.headers['svix-timestamp'];
  
  // In production, verify the signature properly
  return true;
};

// Handle Clerk webhook events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    const eventType = event.type;
    
    console.log('Clerk webhook event:', eventType);
    
    if (eventType === 'user.created') {
      const userData = event.data;
      
      // Create user in your database
      const sql = `
        INSERT INTO users (clerk_id, name, email, phone, profile_image, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (clerk_id) DO UPDATE 
        SET name = EXCLUDED.name, email = EXCLUDED.email
        RETURNING *
      `;
      
      const values = [
        userData.id,
        userData.first_name + ' ' + (userData.last_name || ''),
        userData.email_addresses[0]?.email_address || null,
        userData.phone_numbers[0]?.phone_number || null,
        userData.image_url || null
      ];
      
      const result = await query(sql, values);
      console.log('User created in database:', result.rows[0]);
    }
    
    if (eventType === 'user.updated') {
      const userData = event.data;
      
      const sql = `
        UPDATE users 
        SET name = $1, email = $2, phone = $3, profile_image = $4
        WHERE clerk_id = $5
      `;
      
      await query(sql, [
        userData.first_name + ' ' + (userData.last_name || ''),
        userData.email_addresses[0]?.email_address || null,
        userData.phone_numbers[0]?.phone_number || null,
        userData.image_url || null,
        userData.id
      ]);
    }
    
    if (eventType === 'user.deleted') {
      await query('DELETE FROM users WHERE clerk_id = $1', [event.data.id]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;