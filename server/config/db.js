/**
 * PostgreSQL Database Connection Pool
 * Uses the 'pg' library with connection pooling for performance.
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'restaurantdb',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'BCA232652',
  max: 10,                 // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Log successful connection
pool.on('connect', () => {
  logger.debug('New DB client connected from pool');
});

pool.on('error', (err) => {
  logger.error('Unexpected DB pool error:', err.message);
  process.exit(-1);
});

/**
 * Execute a parameterized SQL query
 * @param {string} text  - SQL query string
 * @param {Array}  params - Query parameters
 * @returns {Promise<pg.QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client from pool (for transactions)
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
