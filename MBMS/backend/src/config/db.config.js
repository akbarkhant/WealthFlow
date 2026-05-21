// db.config.js

const { Pool } = require('pg');
const config = require('./index.config');
const logger = require('./logger.config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,

  // Production-level settings
  max: 20, // maximum clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

  ssl:
    config.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  logger.error(
    { err },
    'Unexpected PostgreSQL pool error'
  );

  process.exit(1);
});

/**
 * Test database connection
 */
async function connectDB() {
  try {
    const client = await pool.connect();

    logger.info('✅ PostgreSQL connected');

    client.release();
  } catch (err) {
    logger.error(
      { err },
      '❌ PostgreSQL connection failed'
    );

    process.exit(1);
  }
}

/**
 * Execute SQL query
 */
async function query(text, values = []) {
  const start = Date.now();

  try {
    const result = await pool.query(text, values);

    const duration = Date.now() - start;

    if (config.NODE_ENV === 'development') {
      logger.debug(
        {
          query: text,
          duration,
          rows: result.rowCount,
        },
        'DB query'
      );
    }

    return result.rows;
  } catch (err) {
    logger.error(
      {
        err,
        query: text,
      },
      'Database query error'
    );

    throw err;
  }
}

/**
 * Transaction helper
 */
async function withTransaction(callback) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await callback(client);

    await client.query('COMMIT');

    return result;
  } catch (err) {
    await client.query('ROLLBACK');

    logger.error(
      { err },
      'Transaction rolled back'
    );

    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  connectDB,
  query,
  withTransaction,
};