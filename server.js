const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

http.createServer((req, res) => {
  // Handle dynamic configuration endpoint
  if (req.url === '/.env') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`GOOGLE_CLIENT_ID=${CLIENT_ID}\n`);
    return;
  }

  // Resolve path
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  // Security check to avoid directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      switch (ext) {
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
