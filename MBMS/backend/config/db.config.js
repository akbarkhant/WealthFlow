import { Pool, PoolClient } from 'pg';
import { config } from './index';
import { logger } from './logger';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,                  // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
  process.exit(1);
});

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  logger.info('✅ PostgreSQL connected');
  client.release();
}

/**
 * Execute a query with automatic error logging.
 */
export async function query<T extends Record<string, unknown>>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const result = await pool.query<T>(text, values);
  const duration = Date.now() - start;

  if (config.NODE_ENV === 'development') {
    logger.debug({ query: text, duration, rows: result.rowCount }, 'DB query');
  }

  return result.rows;
}

/**
 * Run multiple queries inside a single transaction.
 * Automatically rolls back on error.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}