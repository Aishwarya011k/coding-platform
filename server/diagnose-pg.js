import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('\n🔍 PostgreSQL Diagnostic Check\n');
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');

// Try to connect with more detailed error info
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Aishu@1234@localhost:5432/coding-platform',
});

pool.on('error', (err) => {
  console.error('Pool error:', err.message);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('\n❌ Connection Failed');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('\n⚠️  PostgreSQL server is not running or not accessible');
      console.log('Try: Start PostgreSQL service');
    } else if (err.code === 'ENOTFOUND') {
      console.log('\n⚠️  Host not found - check DATABASE_URL');
    } else if (err.code === '3D000') {
      console.log('\n⚠️  Database "coding-platform" does not exist');
      console.log('Try: CREATE DATABASE "coding-platform";');
    }
  } else {
    console.log('\n✅ PostgreSQL Connection Successful!');
    console.log('Current Time:', res.rows[0].now);
  }
  
  pool.end();
  process.exit(err ? 1 : 0);
});

setTimeout(() => {
  console.error('\n❌ Connection timeout');
  pool.end();
  process.exit(1);
}, 5000);
