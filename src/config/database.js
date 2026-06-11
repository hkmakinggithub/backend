// const { Pool } = require('pg');
// const dotenv = require('dotenv');

// dotenv.config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
//   max: 20,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000,
// });

// // Test connection
// pool.connect((err, client, release) => {
//   if (err) {
//     console.log('DATABASE_URL:', process.env.DATABASE_URL);
//     console.error('❌ Database connection error:', err.message);
//   } else {
//     console.log('✅ Connected to PostgreSQL Database!');
//     release();
//   }
// });

// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   pool,
// };


const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,

  // Connection Pool Settings
  max: 20,
  min: 2,

  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,

  // Query Protection
  statement_timeout: 10000,
  query_timeout: 10000,

  allowExitOnIdle: false,
});

// Test Database Connection
const testConnection = async () => {
  let client;

  try {
    client = await pool.connect();

    const result = await client.query('SELECT NOW()');

    console.log('✅ PostgreSQL Connected Successfully');
    console.log('📅 Database Time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ PostgreSQL Connection Failed');
    console.error(error.message);

    if (isProduction) {
      process.exit(1);
    }
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Pool Event Listeners
pool.on('connect', () => {
  console.log('🔗 New PostgreSQL Client Connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL Pool Error:', err);
});

pool.on('remove', () => {
  console.log('🔌 PostgreSQL Client Removed');
});

// Optimized Query Function
const query = async (text, params = []) => {
  const start = Date.now();

  try {
    const result = await pool.query(text, params);

    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(
        `⚠️ Slow Query Detected (${duration}ms):`,
        text.substring(0, 100)
      );
    }

    return result;
  } catch (error) {
    console.error('❌ Database Query Error');
    console.error(error.message);
    throw error;
  }
};

// Graceful Shutdown
const shutdown = async () => {
  try {
    console.log('🛑 Closing PostgreSQL Connections...');
    await pool.end();
    console.log('✅ PostgreSQL Pool Closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Closing PostgreSQL Pool:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Run Connection Test
testConnection();

module.exports = {
  query,
  pool,
};