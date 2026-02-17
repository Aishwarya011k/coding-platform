/**
 * PostgreSQL User Schema Documentation
 * 
 * Table: users
 * 
 * Columns:
 *   - id (SERIAL PRIMARY KEY): Unique user identifier
 *   - name (VARCHAR(100)): User's full name
 *   - email (VARCHAR(100) UNIQUE NOT NULL): User's email address (unique)
 *   - password (VARCHAR(255) NOT NULL): Bcrypt hashed password
 *   - created_at (TIMESTAMP): Account creation timestamp
 *   - updated_at (TIMESTAMP): Last update timestamp
 * 
 * Note: The table is automatically created by server.js when it starts.
 * Make sure PostgreSQL is running and DATABASE_URL is properly configured in .env
 */

export const userSchema = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export default { userSchema };

