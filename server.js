const http = require('http');
const fs = require('fs');
const path = require('path');
const config = require('./backend/config');
const { handleApiRequest } = require('./backend/routes/api');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Handle Backend API Routes
  if (parsedUrl.pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, parsedUrl);
    return;
  }

  // Handle Static File Serving
  let reqPath = decodeURI(parsedUrl.pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(config.ROOT_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'code.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(path.dirname(filePath), 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error: ' + readErr.message);
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

server.listen(config.PORT, () => {
  console.log('===========================================================');
  console.log(` Student Drive Academic Portal Server running`);
  console.log(` URL:          http://localhost:${config.PORT}`);
  console.log(` Storage Mode: ${config.STORAGE_MODE.toUpperCase()} ${config.STORAGE_MODE === 'aws' ? '(Amazon DynamoDB + S3)' : '(Local Persistent JSON)'}`);
  if (config.STORAGE_MODE === 'aws') {
    console.log(` DynamoDB:     ${config.AWS.DYNAMODB_TABLE} (Region: ${config.AWS.REGION})`);
    console.log(` S3 Bucket:    ${config.AWS.S3_BUCKET}`);
  } else {
    console.log(` Database:     ${config.LOCAL_DB_FILE}`);
  }
  console.log('===========================================================');
});
