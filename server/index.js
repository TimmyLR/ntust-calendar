import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeNTUSTSchedule } from './scraper.js';
import { NTUST_SAMPLE_COURSES, NTUST_PERIODS } from './mockData.js';
import { registerUser, loginUser, saveUserData, readDb, writeDb, hashPassword } from './userStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Security Headers ──
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Remove Express fingerprint header
  res.removeHeader('X-Powered-By');
  next();
});

// ── Server-Side Rate Limiter for Auth Endpoints ──
const authRateMap = new Map();
function authRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `${ip}:${req.body?.username || ''}`;
  const now = Date.now();
  const record = authRateMap.get(key) || [];
  const recent = record.filter(t => now - t < 60000);
  if (recent.length >= 10) {
    return res.status(429).json({ success: false, message: '操作過於頻繁，請稍候 1 分鐘後重試。' });
  }
  recent.push(now);
  authRateMap.set(key, recent);
  // Periodically clean old entries
  if (authRateMap.size > 1000) {
    for (const [k, v] of authRateMap) {
      if (v.filter(t => now - t < 60000).length === 0) authRateMap.delete(k);
    }
  }
  next();
}

// Serve static frontend files from 'dist' directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'NTUST Student Calendar API' });
});

// Multi-User Auth API Endpoints
app.post('/api/auth/register', authRateLimit, (req, res) => {
  const { username, password, name } = req.body;
  const result = registerUser(username, password, name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/login', authRateLimit, (req, res) => {
  const { username, password } = req.body;
  const result = loginUser(username, password);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/user/save', authRateLimit, (req, res) => {
  const { username, courses, events } = req.body;
  if (!username || typeof username !== 'string') return res.status(400).json({ success: false, message: 'Invalid request' });
  if (courses && !Array.isArray(courses)) return res.status(400).json({ success: false, message: 'Invalid data' });
  if (events && !Array.isArray(events)) return res.status(400).json({ success: false, message: 'Invalid data' });
  const result = saveUserData(username, courses, events);
  res.json(result);
});

// ── Admin API Endpoints (server-synced user management) ──
app.get('/api/admin/users', (req, res) => {
  const db = readDb();
  // Return user list without exposing password hashes
  const users = Object.values(db).map(u => ({
    username: u.username,
    name: u.name,
    coursesCount: (u.courses || []).length,
    eventsCount: (u.events || []).length,
    courses: u.courses || [],
    events: u.events || []
  }));
  res.json({ success: true, users });
});

app.post('/api/admin/delete-user', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Missing username' });
  const db = readDb();
  if (!db[username]) return res.status(404).json({ success: false, message: '找不到該帳號' });
  delete db[username];
  writeDb(db);
  res.json({ success: true, message: `已刪除帳號：${username}` });
});

app.post('/api/admin/reset-password', (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) return res.status(400).json({ success: false, message: 'Missing fields' });
  const db = readDb();
  if (!db[username]) return res.status(404).json({ success: false, message: '找不到該帳號' });
  db[username].password = hashPassword(newPassword.trim());
  writeDb(db);
  res.json({ success: true, message: `已重設 ${username} 的密碼` });
});

// Fetch sample courses
app.get('/api/sample-courses', (req, res) => {
  res.json({
    success: true,
    courses: NTUST_SAMPLE_COURSES,
    periods: NTUST_PERIODS
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Listen on 0.0.0.0 to support connections from local Wi-Fi mobile devices & iPads
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NTUST Calendar Server running on http://localhost:${PORT}`);
});
