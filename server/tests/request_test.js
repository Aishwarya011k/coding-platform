const http = require('http');

const payload = {
  language: 'python',
  code: "def foo():\n    ppp\n",
  tests: [{ stdin: 'input', expected: '' }],
  funcName: 'foo',
  timeLimitMs: 2000,
  memoryLimitMb: 128
};

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/execute',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    try { console.log('BODY', JSON.parse(body)); } catch(e) { console.log('BODY', body); }
  });
});

req.on('error', (e) => { console.error('REQ ERROR', e); });
req.write(data);
req.end();
