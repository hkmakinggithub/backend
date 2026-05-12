const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false, 
  // },
  // max: 20,
  // idleTimeoutMillis: 30000,
  // // Increased from 2000 to 10000 (10 seconds) so Neon has time to wake up!
  // connectionTimeoutMillis: 10000, 
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to Neon PostgreSQL database:', err.message);
  } else {
    console.log('✅ Connected to Neon PostgreSQL cloud database!');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};