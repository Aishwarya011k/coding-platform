const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');

async function init() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  // Create tables if missing
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      passwordHash TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      lastActive INTEGER,
      streak INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      problemId INTEGER,
      language TEXT,
      code TEXT,
      score INTEGER,
      results TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS otps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      userId INTEGER,
      code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      used INTEGER DEFAULT 0
    );
  `);

  // Ensure users table has emailVerified column
  const info = await db.all("PRAGMA table_info(users)");
  const hasEmailVerified = info.some(r => r.name === 'emailVerified');
  if (!hasEmailVerified) {
    try {
      await db.exec('ALTER TABLE users ADD COLUMN emailVerified INTEGER DEFAULT 0');
    } catch (e) {
      // ignore if cannot alter
      console.warn('Could not add emailVerified column', e.message);
    }
  }

  return db;
}

module.exports = { init };
