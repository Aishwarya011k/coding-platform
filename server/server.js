const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// Generic function to execute commands with timeout and stdin
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

// Java execution function
async function runJava(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'java-run-'));
  try {
    // Extract class name from Java code
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    if (!classNameMatch) {
      throw new Error('Invalid Java code: No public class found');
    }
    const className = classNameMatch[1];

    const javaFile = path.join(tmpRoot, `${className}.java`);
    fs.writeFileSync(javaFile, code, 'utf8');

    // Compile Java code
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

    let results;

    switch (language.toLowerCase()) {
      case 'python':
        results = await runPython(code, tests);
        break;
      case 'java':
        results = await runJava(code, tests);
        break;
      case 'c':
        results = await runC(code, tests);
        break;
      case 'cpp':
      case 'c++':
        results = await runCpp(code, tests);
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
app.post('/api/submit', (req, res) => {
  res.status(200).json({ ok: true, message: 'Submission received' });
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
