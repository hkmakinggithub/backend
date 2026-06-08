const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL Database!');
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};