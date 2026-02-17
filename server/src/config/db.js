import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/coding-platform',
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
