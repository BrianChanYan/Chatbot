const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'chats.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

function readChats() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeChats(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve(null); }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // ===== API Routes =====

  // GET /api/chats — list all chats
  if (req.method === 'GET' && req.url === '/api/chats') {
    const chats = readChats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(chats));
  }

  // POST /api/chats — create a new chat
  if (req.method === 'POST' && req.url === '/api/chats') {
    const body = await parseBody(req);
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    const chats = readChats();
    chats.unshift(body);
    writeChats(chats);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(body));
  }

  // PUT /api/chats/:id — update a chat
  if (req.method === 'PUT' && req.url.startsWith('/api/chats/')) {
    const id = req.url.split('/api/chats/')[1];
    const body = await parseBody(req);
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    let chats = readChats();
    const idx = chats.findIndex(c => c.id === id);
    if (idx === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Not found' }));
    }
    chats[idx] = body;
    writeChats(chats);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(body));
  }

  // DELETE /api/chats/:id — delete a chat
  if (req.method === 'DELETE' && req.url.startsWith('/api/chats/')) {
    const id = req.url.split('/api/chats/')[1];
    let chats = readChats();
    chats = chats.filter(c => c.id !== id);
    writeChats(chats);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  // ===== Static Files =====
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    return res.end(content);
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
