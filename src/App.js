import React, { useState, useEffect } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [code, setCode] = useState(`// Write your solution here
function twoSum(nums, target) {
  // Your code here
}`);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [currentProblem, setCurrentProblem] = useState(0);
  const [submissions, setSubmissions] = useState({}); // problem index -> submitted code
  const problems = [
    {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      sampleInput: 'nums = [2,7,11,15], target = 9',
      sampleOutput: '[0,1]',
      testCases: [
        { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]' },
        { input: 'nums = [3,2,4], target = 6', expected: '[1,2]' }
      ],
      templates: {
        javascript: `function twoSum(nums, target) {
  // Your code here
}`,
        python: `def two_sum(nums, target):
    # Your code here
    pass`,
        c: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
        java: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`
      },
      runner: (func, test) => {
        const nums = JSON.parse(test.input.match(/nums = (\[.*\])/)[1]);
        const target = JSON.parse(test.input.match(/target = (\d+)/)[1]);
        return func(nums, target);
      }
    },
    {
      title: 'Reverse String',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
      constraints: [
        '1 <= s.length <= 10^5',
        's[i] is a printable ascii character.'
      ],
      sampleInput: 's = ["h","e","l","l","o"]',
      sampleOutput: '["o","l","l","e","h"]',
      testCases: [
        { input: 's = ["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
      ],
      templates: {
        javascript: `function reverseString(s) {
  // Your code here
}`,
        python: `def reverse_string(s):
    # Your code here
    pass`,
        c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s, int sSize) {
    // Your code here
}`,
        cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    void reverseString(vector<char>& s) {
        // Your code here
    }
};`,
        java: `public class Solution {
    public void reverseString(char[] s) {
        // Your code here
    }
}`
      },
      runner: (func, test) => {
        const s = JSON.parse(test.input.match(/s = (\[.*\])/)[1]);
        func(s); // modifies in place
        return s;
      }
    }
  ];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, currentProblem, currentView]);

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

  const runCode = () => {
    if (language === 'javascript') {
      try {
        // eslint-disable-next-line no-eval
        eval(code); // define the function in global scope
        const funcName = code.match(/function (\w+)/)[1];
        const func = window[funcName];
        let results = [];
        for (let i = 0; i < problem.testCases.length; i++) {
          const test = problem.testCases[i];
          const result = problem.runner(func, test);
          const passed = JSON.stringify(result) === test.expected;
          results.push(`Test ${i + 1}: ${passed ? 'PASS' : 'FAIL'} - Expected: ${test.expected}, Got: ${JSON.stringify(result)}`);
        }
        setOutput(results.join('\n'));
      } catch (e) {
        setOutput('Error: ' + e.message);
      }
    } else {
      // Mock for other languages - in production, send to backend compiler
      setOutput(`Running ${language} code...\nCompilation and execution for ${language} is not implemented in this prototype.\nIn a real platform, this would be handled by a secure backend (e.g., using Docker containers or Judge0 API).\n\nFor demo, assuming all tests pass: 100%`);
    }
  };

  const submitCode = () => {
    if (language === 'javascript') {
      try {
        // eslint-disable-next-line no-eval
        eval(code);
        const funcName = code.match(/function (\w+)/)[1];
        const func = window[funcName];
        let passed = 0;
        for (let test of problem.testCases) {
          const result = problem.runner(func, test);
          if (JSON.stringify(result) === test.expected) passed++;
        }
        const score = (passed / problem.testCases.length) * 100;
        setSubmissions(prev => ({ ...prev, [currentProblem]: { code, score, language } }));
        setOutput(`Submitted! Score: ${score}% (${passed}/${problem.testCases.length} tests passed)`);
      } catch (e) {
        setOutput('Error: ' + e.message);
      }
    } else {
      setOutput('Submission only available for JavaScript in this prototype. For other languages, a backend compiler is required.');
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
          <button onClick={() => setCurrentView('submissions')}>My Submissions</button>
          {currentView === 'editor' && <span className="timer">Time Left: {formatTime(timeLeft)}</span>}
          {violations > 0 && <span className="violations">Violations: {violations}</span>}
          {!isFullscreen && <button onClick={enterFullscreen}>Enter Fullscreen</button>}
          {isFullscreen && <button onClick={exitFullscreen}>Exit Fullscreen</button>}
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
                <span>Problem {currentProblem + 1} of {problems.length}</span>
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
          </section>
        )}
        {currentView === 'submissions' && (
          <section className="submissions">
            <h2>My Submissions</h2>
            {Object.keys(submissions).length === 0 ? (
              <p>No submissions yet.</p>
            ) : (
              <ul>
                {Object.entries(submissions).map(([idx, sub]) => (
                  <li key={idx}>
                    <strong>{problems[parseInt(idx)].title}</strong>: {sub.score}% 
                    <details>
                      <summary>Code</summary>
                      <pre>{sub.code}</pre>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
