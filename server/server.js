import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import pool from './src/config/db.js';

// Define __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-with-secure-secret';
let db = null;

// Initialize PostgreSQL connection
const connectDB = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✓ PostgreSQL Connected:', res.rows[0].now);
  } catch (error) {
    console.error('\n❌ PostgreSQL Connection Error:');
    console.error('Error Details:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. PostgreSQL server is running');
    console.error('2. DATABASE_URL in .env is correct');
    console.error('3. Database "coding-platform" exists');
    console.error('4. Credentials are valid\n');
    process.exit(1);
  }
};

// Create tables if they don't exist
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        password_reset_token VARCHAR(255),
        password_reset_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table initialized');

    // Add password reset columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;
      `);
      console.log('✓ Password reset columns added');
    } catch (err) {
      // Columns might already exist, which is fine
      if (!err.message.includes('already exists')) {
        console.log('✓ Password reset columns verified');
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

// Connect and initialize on startup
connectDB();
initializeDatabase();
function execSpawn(cmd, args, opts = {}, stdinData = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, opts);
    let stdout = '';
    let stderr = '';
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        try {
          child.kill();
        } catch (e) {
          console.error('Error killing process:', e);
        }
        reject(new Error('Execution timeout'));
      }
    }, timeout);

    if (stdinData && child.stdin) {
      child.stdin.write(stdinData);
      child.stdin.end();
    }

    if (child.stdout) child.stdout.on('data', d => stdout += d.toString());
    if (child.stderr) child.stderr.on('data', d => stderr += d.toString());

    child.on('error', (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

// Initialize Express app
const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '300kb' }));

// Add CSP and cross-origin headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline';");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Import and mount authentication routes (ES6 modules)
let authRoutes = null;
(async () => {
  try {
    const authModule = await import('./src/routes/authRoutes.js');
    authRoutes = authModule.default;
    app.use('/api/auth', authRoutes);
    console.log('✓ Authentication routes mounted at /api/auth');
  } catch (err) {
    console.warn('⚠ Could not load auth routes:', err.message);
  }
})();

// Load other modules as needed - quietly skip if they use CommonJS
(async () => {
  try {
    await import('./executor.js');
  } catch (e) {
    // Skip - optional module
  }
})();

(async () => {
  try {
    const dbMod = await import('./db.js');
    const dbModule = dbMod.default;
    if (dbModule?.init) {
      db = await dbModule.init();
    }
  } catch (e) {
    // Skip - optional module
  }
})();

(async () => {
  try {
    await import('./mail.js');
  } catch (e) {
    // Skip - optional module
  }
})();

// Java execution function
async function runJava(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'java-run-'));
  try {
 
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    if (!classNameMatch) {
      throw new Error('Invalid Java code: No public class found');
    }
    const className = classNameMatch[1];

    const javaFile = path.join(tmpRoot, `${className}.java`);
    fs.writeFileSync(javaFile, code, 'utf8');

    const compileResult = await execSpawn('javac', [javaFile], { cwd: tmpRoot }, null, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }

    const results = [];
    for (const test of tests) {
      const stdinData = test.stdin || '';
      const runResult = await execSpawn('java', [className], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        results.push({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        });
      } else {
        const output = runResult.stdout.trim();
        results.push({
          passed: output === test.expected,
          output,
          expected: test.expected,
          error: null
        });
      }
    }

    return results;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}


async function runC(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'c-run-'));
  try {
    const cFile = path.join(tmpRoot, 'solution.c');
    fs.writeFileSync(cFile, code, 'utf8');

    const compileResult = await execSpawn('gcc', ['-o', 'solution', cFile], { cwd: tmpRoot }, null, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }

    const results = [];
    for (const test of tests) {
      const stdinData = test.stdin || '';
      const runResult = await execSpawn('./solution', [], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        results.push({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        });
      } else {
        const output = runResult.stdout.trim();
        results.push({
          passed: output === test.expected,
          output,
          expected: test.expected,
          error: null
        });
      }
    }

    return results;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// C++ execution function
async function runCpp(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-run-'));
  try {
    const cppFile = path.join(tmpRoot, 'solution.cpp');
    fs.writeFileSync(cppFile, code, 'utf8');

    // Compile C++ code
    const compileResult = await execSpawn('g++', ['-o', 'solution', cppFile], { cwd: tmpRoot }, null, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }

    const results = [];
    for (const test of tests) {
      const stdinData = test.stdin || '';
      const runResult = await execSpawn('./solution', [], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        results.push({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        });
      } else {
        const output = runResult.stdout.trim();
        results.push({
          passed: output === test.expected,
          output,
          expected: test.expected,
          error: null
        });
      }
    }

    return results;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// Add Python execution logic
async function runPython(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'python-run-'));
  try {
    const pythonFile = path.join(tmpRoot, 'solution.py');
    fs.writeFileSync(pythonFile, code, 'utf8');

    const results = [];
    for (const test of tests) {
      const stdinData = test.stdin || '';
      const runResult = await execSpawn('python3', [pythonFile], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        results.push({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        });
      } else {
        const output = runResult.stdout.trim();
        results.push({
          passed: output === test.expected,
          output,
          expected: test.expected,
          error: null
        });
      }
    }

    return results;
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

// Node.js/JavaScript execution
async function runNodeJS(code, tests, funcName) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'node-run-'));
  try {
    const jsFile = path.join(tmpRoot, 'solution.js');
    fs.writeFileSync(jsFile, code, 'utf8');

    const results = [];
    for (const test of tests) {
      const stdinData = test.stdin || '';
      const runResult = await execSpawn('node', [jsFile], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        results.push({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        });
      } else {
        const output = runResult.stdout.trim();
        results.push({
          passed: output === test.expected,
          output,
          expected: test.expected,
          error: null
        });
      }
    }
    return results;
  } finally {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (e) { }
  }
}

// Helper to wrap user-provided function-only code into a complete program
function wrapUserCodeForRunner(language, userCode, funcName) {
  const fn = funcName || 'solve';
  const lang = (language || '').toLowerCase();
  switch (lang) {
    case 'python': {
      return userCode + "\n\nif __name__ == '__main__':\n    import sys\n    data = sys.stdin.read()\n    try:\n        res = " + fn + "(data)\n    except TypeError:\n        try:\n            res = " + fn + "()\n        except Exception:\n            res = None\n    if res is not None:\n        print(res)\n";
    }
    case 'javascript':
    case 'js': {
      return userCode + "\n\nif (require.main === module) {\n  const fs = require('fs');\n  const data = fs.readFileSync(0, 'utf8');\n  try {\n    const out = (typeof " + fn + " === 'function') ? " + fn + "(data) : undefined;\n    if (out !== undefined && out !== null) console.log(out);\n  } catch (e) {}\n}\n";
    }
    case 'java': {
      // Place user code inside Main class and call static funcName(String)
      const indented = userCode.split('\n').map(l => '  ' + l).join('\n');
      return 'public class Main {\n' + indented + '\n\n  public static void main(String[] args) throws Exception {\n    java.util.Scanner s = new java.util.Scanner(System.in);\n    StringBuilder sb = new StringBuilder();\n    while (s.hasNextLine()) { sb.append(s.nextLine()); if (s.hasNextLine()) sb.append("\\n"); }\n    String res = null;\n    try { res = ' + fn + '(sb.toString()); } catch (NoSuchMethodError e) { try { ' + fn + '(); } catch (Exception ex) {} }\n    if (res != null) System.out.println(res);\n  }\n}\n';
    }
    case 'c':
    case 'cpp':
    case 'c++': {
      // Assume user provides a function `void funcName()` or `int funcName()` that performs IO
      return userCode + '\n\nint main() {\n    ' + fn + '();\n    return 0;\n}\n';
    }
    default:
      return userCode;
  }
}

// Main execution endpoint
app.post('/api/run', async (req, res) => {
  try {
    const { language, code, tests } = req.body;

    if (!code || !Array.isArray(tests)) {
      return res.status(400).json({ error: 'Missing required fields: code or tests' });
    }

    if (!language) {
      return res.status(400).json({ error: 'Language not specified' });
    }

    // Prepare tests: normalize to { stdin, expected }
    const preparedTests = (tests || []).map(t => {
      if (t.stdin !== undefined) return { stdin: t.stdin, expected: t.expected };
      if (t.input !== undefined) return { stdin: t.input, expected: t.expected };
      if (t.args !== undefined) return { stdin: JSON.stringify(t.args), expected: t.expected };
      return { stdin: '', expected: t.expected };
    });

    const wrappedCode = wrapUserCodeForRunner(language, code, req.body.funcName);

    let results;
    switch (language.toLowerCase()) {
      case 'python':
        results = await runPython(wrappedCode, preparedTests);
        break;
      case 'java':
        results = await runJava(wrappedCode, preparedTests);
        break;
      case 'c':
        results = await runC(wrappedCode, preparedTests);
        break;
      case 'cpp':
      case 'c++':
        results = await runCpp(wrappedCode, preparedTests);
        break;
      default:
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    return res.json({ results });
  } catch (e) {
    console.error('Execution error:', e);
    res.status(500).json({ error: String(e) });
  }
});

// Placeholder for submission endpoint
// Protected endpoint middleware
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const now = Date.now();
    const result = await db.run('INSERT INTO users (email, name, passwordHash, createdAt, lastActive, streak) VALUES (?, ?, ?, ?, ?, ?)', email, name || null, hash, now, now, 1);
    const userId = result.lastID;
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const user = await db.get('SELECT id, passwordHash FROM users WHERE email = ?', email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
    // update lastActive and streak if needed
    await db.run('UPDATE users SET lastActive = ? WHERE id = ?', Date.now(), user.id);
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Request OTP for verify or reset
app.post('/api/request-otp', async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) return res.status(400).json({ error: 'email and purpose required' });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    // try to find user
    const user = await db.get('SELECT id FROM users WHERE email = ?', email);
    const userId = user ? user.id : null;
    await db.run('INSERT INTO otps (email, userId, code, purpose, expiresAt, used) VALUES (?, ?, ?, ?, ?, 0)', email, userId, code, purpose, expiresAt);
    try { await sendOtpEmail(email, code, purpose); } catch (e) { console.warn('Email send failed', e.message); }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, code, purpose, newPassword } = req.body;
    if (!email || !code || !purpose) return res.status(400).json({ error: 'email, code and purpose required' });
    const row = await db.get('SELECT * FROM otps WHERE email = ? AND code = ? AND purpose = ? AND used = 0 ORDER BY id DESC LIMIT 1', email, code, purpose);
    if (!row) return res.status(400).json({ error: 'Invalid code' });
    if (row.expiresAt < Date.now()) return res.status(400).json({ error: 'Code expired' });
    // mark used
    await db.run('UPDATE otps SET used = 1 WHERE id = ?', row.id);
    if (purpose === 'verify') {
      // ensure user exists
      let user = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (!user) {
        const now = Date.now();
        const result = await db.run('INSERT INTO users (email, name, passwordHash, createdAt, lastActive, streak, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)', email, null, '', now, now, 0, 1);
        user = { id: result.lastID };
      } else {
        await db.run('UPDATE users SET emailVerified = 1 WHERE id = ?', user.id);
      }
      return res.json({ ok: true });
    }
    if (purpose === 'reset') {
      if (!newPassword) return res.status(400).json({ error: 'newPassword required to reset' });
      const user = await db.get('SELECT id FROM users WHERE email = ?', email);
      if (!user) return res.status(400).json({ error: 'User not found' });
      const hash = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET passwordHash = ? WHERE id = ?', hash, user.id);
      return res.json({ ok: true });
    }
    res.status(400).json({ error: 'Unknown purpose' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'OTP verify failed' });
  }
});

// Send a test email (useful to verify SMTP configuration)
app.post('/api/send-test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    await sendTestEmail(email, 'OSL Coding Platform - Test Email', 'This is a test email from your platform. If you received this, SMTP is working.');
    res.json({ ok: true });
  } catch (e) {
    console.error('Test email send failed', e);
    res.status(500).json({ error: 'Failed to send test email', detail: e.message });
  }
});

// Check SMTP transporter status
app.get('/api/smtp-status', async (req, res) => {
  try {
    const result = await verifyTransporter();
    if (result.ok) return res.json({ ok: true });
    return res.status(500).json({ ok: false, error: result.error });
  } catch (e) {
    console.error('SMTP status check failed', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Get authenticated user profile
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const u = await db.get('SELECT id, email, name, createdAt, lastActive, streak FROM users WHERE id = ?', req.user.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ user: u });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Save submission and return id
app.post('/api/submit', authMiddleware, async (req, res) => {
  try {
    const { problemId, language, code, score, results } = req.body;
    const now = Date.now();
    const r = await db.run('INSERT INTO submissions (userId, problemId, language, code, score, results, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', req.user.id, problemId || null, language || null, code || null, typeof score === 'number' ? score : null, JSON.stringify(results || []), now);
    // update streak
    const user = await db.get('SELECT lastActive, streak FROM users WHERE id = ?', req.user.id);
    const lastActive = user.lastActive || 0;
    const lastDate = new Date(lastActive).setHours(0,0,0,0);
    const today = new Date(now).setHours(0,0,0,0);
    let streak = user.streak || 0;
    if (lastDate === today) {
      // same day, unchanged
    } else if (lastDate === today - 24*60*60*1000) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
    await db.run('UPDATE users SET lastActive = ?, streak = ? WHERE id = ?', now, streak, req.user.id);
    res.json({ ok: true, id: r.lastID });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Submit failed' });
  }
});

// List submissions for the authenticated user
app.get('/api/submissions', authMiddleware, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, problemId, language, score, results, createdAt FROM submissions WHERE userId = ? ORDER BY createdAt DESC LIMIT 500', req.user.id);
    const parsed = rows.map(r => ({ ...r, results: r.results ? JSON.parse(r.results) : [] }));
    res.json({ submissions: parsed });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Main submission runner that dispatches to language-specific runners
async function runSubmission({ language, code, tests, timeLimitMs, memoryLimitMb, outputLimitBytes, funcName }) {
  if (!language || !code || !tests) {
    throw new Error('language, code, and tests are required');
  }

  switch (language.toLowerCase()) {
    case 'java':
      return await runJava(code, tests);
    case 'c':
      return await runC(code, tests);
    case 'cpp':
    case 'c++':
      return await runCpp(code, tests);
    case 'python':
      return await runPython(code, tests);
    case 'javascript':
    case 'js':
      return await runNodeJS(code, tests, funcName);
    default:
      throw new Error(`Language "${language}" is not supported`);
  }
}

// Optional Docker-backed secure execution endpoint
app.post('/execute', async (req, res) => {
  try {
    const { language, code, tests, funcName, timeLimitMs, memoryLimitMb, outputLimitBytes } = req.body;
    if (!language || !code || !Array.isArray(tests)) return res.status(400).json({ error: 'language, code and tests required' });

    const results = await runSubmission({ language, code, tests, timeLimitMs: timeLimitMs || 1000, memoryLimitMb: memoryLimitMb || 256, outputLimitBytes: outputLimitBytes || 65536, funcName });
    return res.json({ results });
  } catch (e) {
    console.error('Execution error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Serve frontend build if present. Support multiple build locations and env override.
const candidateBuildPaths = [];
if (process.env.BUILD_DIR) candidateBuildPaths.push(process.env.BUILD_DIR);
candidateBuildPaths.push(path.join(__dirname, '..', 'build'));
candidateBuildPaths.push(path.join(__dirname, 'build'));

let resolvedBuildPath = null;
for (const pth of candidateBuildPaths) {
  if (pth && fs.existsSync(pth)) {
    resolvedBuildPath = pth;
    break;
  }
}

if (resolvedBuildPath) {
  app.use(express.static(resolvedBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(resolvedBuildPath, 'index.html'));
  });
}

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`Multi-language code execution server listening on port ${port}`));

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is in use. Please kill the other process or set PORT environment variable.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
