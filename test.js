const http = require('http');

const data = JSON.stringify({
  name: 'Test Setup User',
  password: 'securepass',
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/assistants',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:', responseData);
    });
  }
);

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
