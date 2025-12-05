import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marketplace_deals',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Test connection on startup
pool.getConnection()
  .then((connection) => {
    console.log('✓ Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err.message);
  });

export default pool;
