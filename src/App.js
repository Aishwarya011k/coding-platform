import React, { useState, useEffect } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import detectDevTools from 'devtools-detect';
import './App.css';
import AuthForm from './components/AuthForm';
import Account from './components/Account';
import { allProblems } from './problems';
import authService from './services/authService';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [violations, setViolations] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('cp_token') || null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [code, setCode] = useState(`// Write your solution here
function twoSum(nums, target) {
  // Your code here
}`);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [submissions, setSubmissions] = useState({}); 
  const problems = allProblems;
  const problem = problems[currentProblem];

  useEffect(() => {
    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => prev + 1);
        alert('Tab switching detected! This is a violation.');
      }
    };

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      setViolations(prev => prev + 1);
      alert('Right-click disabled!');
    };

    // Prevent copy-paste globally
    const handleCopyPaste = (e) => {
      e.preventDefault();
      setViolations(prev => prev + 1);
      alert('Copy-paste disabled!');
    };

    // Dev tools detection
    // devtools.on('open', () => {
    //   setViolations(prev => prev + 1);
    //   alert('Developer tools detected! This is a violation.');
    // });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      // devtools.off('open');
    };
  }, []);

  useEffect(() => {
    if (currentView === 'editor' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentView, timeLeft]);

  useEffect(() => {
    if (currentView === 'editor' && problem.templates && problem.templates[language]) {
      setCode(problem.templates[language]);
    }
    
  }, [language, currentProblem, currentView]);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (token) {
        try {
          // Handle successful OAuth callback
          const result = await authService.handleGoogleCallback();
          setToken(result.token);
          // Redirect to account view or wherever appropriate
          setCurrentView('account');
        } catch (err) {
          console.error('OAuth callback error:', err);
          // Could show error message to user
        }
      } else if (error) {
        console.error('OAuth error:', decodeURIComponent(error));
        // Could show error message to user
      }
    };

    handleGoogleCallback();
  }, []); // Run once on mount


  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Define a dynamic base URL for API calls
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  const formatResults = (results) => {
    if (!results || results.length === 0) return 'No results';
    const lines = [];
    results.forEach((r, idx) => {
      lines.push(`Test ${idx + 1}: ${r.passed ? 'Passed' : 'Failed'}`);
      const out = r.stdout ?? r.output ?? r.out ?? '';
      const err = r.stderr ?? r.error ?? r.compileError ?? '';
      if (out && String(out).trim().length) lines.push(`  stdout: ${String(out).trim()}`);
      if (err && String(err).trim()) lines.push(`  stderr/error: ${String(err).trim()}`);
      if (r.timeMs !== undefined && r.timeMs !== null) lines.push(`  time: ${r.timeMs} ms`);
      if (r.exitCode !== undefined && r.exitCode !== null) lines.push(`  exit code: ${r.exitCode}`);
      lines.push('');
    });
    return lines.join('\n');
  };

  // Update runCode function to use dynamic base URL
  const runCode = async () => {
    try {
      const funcName = (function extractFuncName(code, language) {
        try {
          if (language === 'python') {
            const m = code.match(/def\s+([A-Za-z0-9_]+)\s*\(/);
            return m ? m[1] : null;
          }
          if (language === 'javascript') {
            const m = code.match(/function\s+([A-Za-z0-9_]+)\s*\(/);
            return m ? m[1] : null;
          }
          if (language === 'java') {
            const m = code.match(/(?:public|private|protected)?\s+static\s+[A-Za-z0-9_<>\[\]]+\s+([A-Za-z0-9_]+)\s*\(/);
            return m ? m[1] : null;
          }
          if (language === 'c' || language === 'cpp') {
            const m = code.match(/([A-Za-z0-9_]+)\s*\([^;\)]*\)\s*\{/);
            return m ? m[1] : null;
          }
          return null;
        } catch (e) { return null; }
      })(code, language);

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      const response = await fetch(`${API_BASE_URL}/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          language,
          code,
          funcName,
          tests: problems[currentProblem].testCases,
          timeLimitMs: 2000,
          memoryLimitMb: 256
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        setOutput(`Runner error: ${data.error}`);
      } else {
        // show compile/runtime errors prominently (compileError, error, or stderr)
        const results = data.results || [];
        const errRes = results.find(r => r && (r.compileError || r.error || (r.stderr && String(r.stderr).trim().length > 0)));
        if (errRes) {
          const msg = errRes.compileError || errRes.error || errRes.stderr;
          setOutput(`Error:\n${msg}`);
        } else {
          setOutput(formatResults(results));
        }
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  // Update submitCode function to use dynamic base URL
  const submitCode = async () => {
    setOutput('Submitting...');
    const buildTests = () => {
      const tests = [];
      for (const tc of problem.testCases) {
        if (tc.stdin) {
          tests.push({ input: tc.stdin, expected: tc.expected });
        } else {
          const input = tc.input || '';
          const args = [];
          const arrMatch = input.match(/(\[.*\])/);
          if (arrMatch) {
            try {
              args.push(JSON.parse(arrMatch[1]));
            } catch (e) {
              args.push(arrMatch[1]);
            }
          }
          const numMatch = input.match(/target\s*=\s*([\-]?[0-9]+)/);
          if (numMatch) args.push(Number(numMatch[1]));
          if (args.length === 0 && input.length) args.push(input);
          tests.push({ args, expected: tc.expected });
        }
      }
      return tests;
    };

    const funcName = (function extractFuncName(code, language) {
      try {
        if (language === 'python') {
          const m = code.match(/def\s+([A-Za-z0-9_]+)\s*\(/);
          return m ? m[1] : null;
        }
        if (language === 'javascript') {
          const m = code.match(/function\s+([A-Za-z0-9_]+)\s*\(/);
          return m ? m[1] : null;
        }
        if (language === 'java') {
          const m = code.match(/(?:public|private|protected)?\s+static\s+[A-Za-z0-9_<>\[\]]+\s+([A-Za-z0-9_]+)\s*\(/);
          return m ? m[1] : null;
        }
        if (language === 'c' || language === 'cpp') {
          const m = code.match(/([A-Za-z0-9_]+)\s*\([^;\)]*\)\s*\{/);
          return m ? m[1] : null;
        }
        return null;
      } catch (e) { return null; }
    })(code, language);

    const prepared = buildTests();
    try {
      const execHeaders = { 'Content-Type': 'application/json' };
      if (token) execHeaders['Authorization'] = 'Bearer ' + token;
      const resp = await fetch(`${API_BASE_URL}/execute`, {
        method: 'POST',
        headers: execHeaders,
        body: JSON.stringify({ language, code, funcName, tests: prepared }),
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.statusText}`);
      }

      const data = await resp.json();
      if (data.error) {
        setOutput(`Runner error: ${data.error}`);
        return;
      }

      const results = data.results || [];
      // If any result has compile/runtime stderr or compileError, show it first
      const errRes = results.find(r => r && (r.compileError || r.error || (r.stderr && String(r.stderr).trim().length > 0)));
      if (errRes) {
        const msg = errRes.compileError || errRes.error || errRes.stderr;
        setOutput(`Error:\n${msg}`);
        return;
      }

      const passedCount = results.filter(r => r.passed).length;
      const score = Math.round((passedCount / (prepared.length || 1)) * 100);

      const submitHeaders = { 'Content-Type': 'application/json' };
      if (token) submitHeaders['Authorization'] = 'Bearer ' + token;
      const submitResp = await fetch(`${API_BASE_URL}/api/submit`, {
        method: 'POST',
        headers: submitHeaders,
        body: JSON.stringify({ problemId: currentProblem, language, code, score }),
      });

      if (!submitResp.ok) {
        throw new Error(`Server error: ${submitResp.statusText}`);
      }

      const submitData = await submitResp.json();
      if (submitData.error) {
        setOutput(`Submit error: ${submitData.error}`);
      } else {
        // Show runner results followed by submission confirmation
        const resultsText = formatResults(results || []);
        setOutput(`${resultsText}\nSubmitted! Score: ${score}% (${passedCount}/${prepared.length}) - id ${submitData.id}`);
      }
    } catch (e) {
      setOutput(`Network/submit error: ${e.message}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Coding Competition Platform</h1>
        <div className="nav">
          <button onClick={() => setCurrentView('home')}>Home</button>
          <button onClick={() => setCurrentView('contests')}>Contests</button>
          {token && <button onClick={() => setCurrentView('submissions')}>My Submissions</button>}
          {currentView === 'editor' && <span className="timer">Time Left: {formatTime(timeLeft)}</span>}
          {violations > 0 && <span className="violations">Violations: {violations}</span>}
          {!isFullscreen && currentView === 'editor' && <button onClick={enterFullscreen}>Enter Fullscreen</button>}
          {isFullscreen && currentView === 'editor' && <button onClick={exitFullscreen}>Exit Fullscreen</button>}
          {token ? (
            <button onClick={() => setCurrentView('submissions')} style={{ marginLeft: 'auto', backgroundColor: '#4CAF50', color: 'white' }}>Account</button>
          ) : (
            <button onClick={() => setCurrentView('submissions')} style={{ marginLeft: 'auto', backgroundColor: '#2196F3', color: 'white' }}>Sign In</button>
          )}
        </div>
      </header>
      <main>
        {currentView === 'home' && (
          <section className="home">
            <h2>Welcome to the Coding Competition Platform</h2>
            <p>This platform prevents tab switching and copy-paste for fair competitions.</p>
            <p>Violations detected: {violations}</p>
          </section>
        )}
        {currentView === 'contests' && (
          <section className="contests">
            <h2>Available Contests</h2>
            <ul>
              <li onClick={() => setCurrentView('problems')}>Sample Contest 1</li>
              <li>Sample Contest 2 (Coming Soon)</li>
            </ul>
          </section>
        )}
        {currentView === 'problems' && (
          <section className="problems">
            <h2>Problems</h2>
            <ul>
              {problems.map((p, i) => (
                <li key={i} onClick={() => { 
                  setCurrentProblem(i); 
                  setCurrentView('editor'); 
                  setCode(p.templates[language] || '// Template not available'); 
                }}>
                  {p.title}
                </li>
              ))}
            </ul>
          </section>
        )}
        {currentView === 'editor' && (
          <section className="editor">
            <div className="problem-statement">
              <h2>{problem.title}</h2>
              <p>{problem.description}</p>
              <h3>Constraints:</h3>
              <ul>
                {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
              <h3>Sample Input:</h3>
              <pre>{problem.sampleInput}</pre>
              <h3>Sample Output:</h3>
              <pre>{problem.sampleOutput}</pre>
            </div>
            <div className="code-section">
              <div className="code-header">
                <div>
                  <button onClick={() => setCurrentProblem(Math.max(0, currentProblem - 1))}>Prev</button>
                  <span style={{ marginLeft: '10px', marginRight: '10px', fontWeight: 'bold' }}>
                    Test {problem.testNum} - {problem.difficulty} | {problem.title} | Problem {currentProblem + 1} of {problems.length}
                  </span>
                  <button onClick={() => setCurrentProblem(Math.min(problems.length - 1, currentProblem + 1))}>Next</button>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
                <button onClick={runCode}>Run Code</button>
                <button onClick={submitCode}>Submit</button>
              </div>
              <div className="code-editor-container">
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <CodeMirror
                    value={code}
                    options={{
                      mode: language === 'python' ? 'python' : language === 'javascript' ? 'javascript' : 'clike',
                      theme: 'default',
                      lineNumbers: true,
                      readOnly: false,
                      tabSize: 2,
                      indentWithTabs: false,
                    }}
                    onChange={(editor, data, value) => {
                      setCode(value);
                    }}
                    onKeyDown={(editor, event) => {
                      if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x'].includes(event.key.toLowerCase())) {
                        event.preventDefault();
                        setViolations(prev => prev + 1);
                        alert('Copy-paste disabled!');
                      }
                    }}
                  />
                  <div className="output">
                    <h3>Output:</h3>
                    <pre>{output}</pre>
                  </div>
                </div>
                <div className="test-cases-section">
                <h3>Test Cases:</h3>
                <div className="test-cases-list">
                  {problem.testCases.map((tc, index) => (
                    <div key={index} className="test-case">
                      <div className="test-case-header">
                        <strong>Test Case {index + 1}:</strong>
                        {tc.stdin ? <span> (Stdin Input)</span> : <span> (Function Args)</span>}
                      </div>
                      <div className="test-case-content">
                        {tc.stdin ? (
                          <div>
                            <div><strong>Input:</strong> {tc.stdin.split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
                          </div>
                        ) : (
                          <div>
                            <div><strong>Input:</strong> {tc.input}</div>
                          </div>
                        )}
                        <div><strong>Expected:</strong> {JSON.stringify(tc.expected)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div> 
          </section>
        )}
        {currentView === 'submissions' && token && (
          <Account token={token} onLogout={() => { setToken(null); localStorage.removeItem('cp_token'); }} />
        )}
        {currentView === 'submissions' && !token && (
          <div style={{ padding:12 }}>
            <AuthForm onLogin={(t) => { setToken(t); localStorage.setItem('cp_token', t); }} />
          </div>
        )}
      </main>
    </div>
  );
}

 export default App;