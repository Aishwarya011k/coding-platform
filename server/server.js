
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
    const compileResult = await execSpawn('javac', [javaFile], { cwd: tmpRoot }, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }

    // Check if code reads from stdin (contains Scanner, System.in, etc.)
    const hasStdin = /Scanner|System\.in|BufferedReader|InputStreamReader/i.test(code);

    if (hasStdin) {
      // Stdin-based solution - run once with all test inputs
      const stdinData = tests.map(t => Array.isArray(t.input) ? t.input.join('\n') : t.input).join('\n');
      const runResult = await execSpawn('java', [className], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        return tests.map(test => ({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        }));
      }

      const outputLines = runResult.stdout.split(/\r?\n/).filter(line => line.trim() !== '');
      return tests.map((test, idx) => {
        const outputLine = outputLines[idx] || null;
        const expectedStr = typeof test.expected === 'string' ? test.expected : JSON.stringify(test.expected);

        return {
          passed: outputLine && outputLine.trim() === expectedStr.trim(),
          output: outputLine,
          expected: test.expected,
          error: runResult.stderr || null
        };
      });
    } else {
      
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const args = test.args ? test.args.map(arg => JSON.stringify(arg)).join(' ') : '';
        const runResult = await execSpawn('java', [className], { cwd: tmpRoot }, null, 10000);

        if (runResult.code !== 0) {
          results.push({
            passed: false,
            output: null,
            expected: test.expected,
            error: runResult.stderr
          });
        } else {
          const output = runResult.stdout.trim();
          const expectedStr = JSON.stringify(test.expected);

          results.push({
            passed: output.includes(expectedStr),
            output: output,
            expected: test.expected,
            error: runResult.stderr || null
          });
        }
      }

      return results;
    }
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch (e) {
      console.error('Error cleaning up temp directory:', e);
    }
  }
}


async function runC(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'c-run-'));
  try {
    const cFile = path.join(tmpRoot, 'solution.c');
    fs.writeFileSync(cFile, code, 'utf8');

    const compileResult = await execSpawn('gcc', ['-o', 'solution', 'solution.c'], { cwd: tmpRoot }, null, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }
    const hasStdin = /scanf|fgets|getchar|fgetc|read/i.test(code);

    if (hasStdin) {
      const stdinData = tests.map(t => Array.isArray(t.input) ? t.input.join('\n') : t.input).join('\n');
      const runResult = await execSpawn('./solution', [], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        return tests.map(test => ({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        }));
      }

      const outputLines = runResult.stdout.split(/\r?\n/).filter(line => line.trim() !== '');
      return tests.map((test, idx) => {
        const outputLine = outputLines[idx] || null;
        const expectedStr = typeof test.expected === 'string' ? test.expected : JSON.stringify(test.expected);

        return {
          passed: outputLine && outputLine.trim() === expectedStr.trim(),
          output: outputLine,
          expected: test.expected,
          error: runResult.stderr || null
        };
      });
    } else {
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const args = test.args ? test.args.map(arg => JSON.stringify(arg)) : [];
        const runResult = await execSpawn('./solution', args, { cwd: tmpRoot }, null, 10000);

        if (runResult.code !== 0) {
          results.push({
            passed: false,
            output: null,
            expected: test.expected,
            error: runResult.stderr
          });
        } else {
          const output = runResult.stdout.trim();
          const expectedStr = JSON.stringify(test.expected);

          results.push({
            passed: output.includes(expectedStr),
            output: output,
            expected: test.expected,
            error: runResult.stderr || null
          });
        }
      }

      return results;
    }
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch (e) {
      console.error('Error cleaning up temp directory:', e);
    }
  }
}

// C++ execution function
async function runCpp(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cpp-run-'));
  try {
    const cppFile = path.join(tmpRoot, 'solution.cpp');
    fs.writeFileSync(cppFile, code, 'utf8');

    // Compile C++ code
    const compileResult = await execSpawn('g++', ['-o', 'solution', 'solution.cpp'], { cwd: tmpRoot }, null, 15000);
    if (compileResult.code !== 0) {
      return [{ passed: false, output: null, expected: null, error: compileResult.stderr }];
    }

    // Check if code reads from stdin (contains cin, scanf, etc.)
    const hasStdin = /cin|scanf|getline|getchar/i.test(code);

    if (hasStdin) {
      // Stdin-based solution - run once with all test inputs
      const stdinData = tests.map(t => Array.isArray(t.input) ? t.input.join('\n') : t.input).join('\n');
      const runResult = await execSpawn('./solution', [], { cwd: tmpRoot }, stdinData, 10000);

      if (runResult.code !== 0) {
        return tests.map(test => ({
          passed: false,
          output: null,
          expected: test.expected,
          error: runResult.stderr
        }));
      }

      const outputLines = runResult.stdout.split(/\r?\n/).filter(line => line.trim() !== '');
      return tests.map((test, idx) => {
        const outputLine = outputLines[idx] || null;
        const expectedStr = typeof test.expected === 'string' ? test.expected : JSON.stringify(test.expected);

        return {
          passed: outputLine && outputLine.trim() === expectedStr.trim(),
          output: outputLine,
          expected: test.expected,
          error: runResult.stderr || null
        };
      });
    } else {
      
      const results = [];
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        // Pass arguments as command-line arguments
        const args = test.args ? test.args.map(arg => JSON.stringify(arg)) : [];
        const runResult = await execSpawn('./solution', args, { cwd: tmpRoot }, null, 10000);

        if (runResult.code !== 0) {
          results.push({
            passed: false,
            output: null,
            expected: test.expected,
            error: runResult.stderr
          });
        } else {
          const output = runResult.stdout.trim();
          const expectedStr = JSON.stringify(test.expected);

          results.push({
            passed: output.includes(expectedStr),
            output: output,
            expected: test.expected,
            error: runResult.stderr || null
          });
        }
      }

      return results;
    }
  } finally {
    // Cleanup temp directory
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch (e) {
      console.error('Error cleaning up temp directory:', e);
    }
  }
}


async function runPython(code, tests) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'py-run-'));
  try {
    const sol = path.join(tmpRoot, 'solution.py');
    fs.writeFileSync(sol, code, 'utf8');

    // Handle both function-based and stdin-based solutions
    const hasFunction = code.match(/def\s+\w+\s*\(/);

    if (hasFunction) {
      // Function-based solution
      const driver = [];
      driver.push('import json');
      driver.push('');
      driver.push(fs.readFileSync(sol, 'utf8'));
      driver.push('');
      driver.push('def _run_tests():');
      const funcName = (code.match(/def\s+(\w+)\s*\(/) || [null, null])[1];

      if (!funcName) {
        throw new Error('No function definition found in Python code');
      }

      tests.forEach((t) => {
        const argsLiteral = JSON.stringify(t.args || []);
        driver.push('  try:');
        driver.push(`    _args = json.loads(r'''${argsLiteral}''')`);
        driver.push(`    res = ${funcName}(*_args)`);
        driver.push('    print(json.dumps(res))');
        driver.push('  except Exception as e:');
        driver.push("    print('RUNTIME_ERROR:' + str(e))");
      });
      driver.push('');
      driver.push("if __name__ == '__main__':");
      driver.push('  _run_tests()');

      const driverFile = path.join(tmpRoot, 'driver.py');
      fs.writeFileSync(driverFile, driver.join('\n'), 'utf8');

      const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
      const result = await execSpawn(pyCmd, [driverFile], { cwd: tmpRoot }, 10000)
        .catch(e => ({ code: 1, stdout: '', stderr: String(e) }));

      const out = result.stdout || '';
      const lines = out.split(/\r?\n/).filter(Boolean);

      return tests.map((t, idx) => {
        const line = lines[idx] || null;
        if (!line) {
          return {
            passed: false,
            output: null,
            expected: t.expected,
            error: result.stderr || 'no output'
          };
        }

        if (line.startsWith('RUNTIME_ERROR:')) {
          return {
            passed: false,
            output: null,
            expected: t.expected,
            error: line.substring(14) 
          };
        }

        try {
          const parsed = JSON.parse(line);
          return {
            passed: JSON.stringify(parsed) === JSON.stringify(t.expected),
            output: parsed,
            expected: t.expected,
            error: null
          };
        } catch (e) {
          return {
            passed: false,
            output: line,
            expected: t.expected,
            error: null
          };
        }
      });
    } else {
      // Stdin-based solution - run the code once with all test inputs
      const pyCmd = process.platform === 'win32' ? 'python' : 'python3';

      
      const stdinData = tests.map(t => Array.isArray(t.input) ? t.input.join('\n') : t.input).join('\n');
      const result = await execSpawn(pyCmd, [sol], { cwd: tmpRoot }, stdinData, 10000)
        .catch(e => ({ code: 1, stdout: '', stderr: String(e) }));

      const out = result.stdout || '';
      const lines = out.split(/\r?\n/).filter(Boolean);

      return tests.map((t, idx) => {
        const outputLine = lines[idx] || null;
        const expectedStr = typeof t.expected === 'string' ? t.expected : JSON.stringify(t.expected);

        return {
          passed: outputLine && outputLine.trim() === expectedStr.trim(),
          output: outputLine,
          expected: t.expected,
          error: result.stderr || null
        };
      });
    }
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch (e) {
      console.error('Error cleaning up temp directory:', e);
    }
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

// Serve frontend build if present
const buildPath = path.join(__dirname, '..', 'build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const port = process.env.PORT || 4000;
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
