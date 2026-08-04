import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { FIVE_SAMPLE_DEMO_COURSES } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'users_db.json');

export function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

const getInitialSampleEvents = () => [
  {
    id: 'evt-sample-1',
    title: '[演算法] 期中報告',
    courseId: 'course-1',
    courseName: '演算法 (Algorithms)',
    tag: '期中報告',
    tagIcon: '📝',
    date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    period: '3',
    startTime: '10:20',
    endTime: '11:10',
    location: 'MA-205',
    color: '#3B82F6',
    description: '第三組簡報發表',
    createdAt: new Date().toISOString()
  }
];

function initDb() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      visitor: {
        username: 'visitor',
        password: '',
        name: '訪客試用',
        courses: FIVE_SAMPLE_DEMO_COURSES,
        events: getInitialSampleEvents()
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export function readDb() {
  try {
    initDb();
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function writeDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) { console.error('[DB Write Error]', err.message); }
}

export function registerUser(username, password, name) {
  const uKey = (username || '').trim().toLowerCase();
  if (!uKey || !password) return { success: false, message: '請輸入帳號與密碼！' };

  if (!/^[a-zA-Z0-9_]{2,20}$/.test(uKey)) return { success: false, message: '帳號僅允許英文、數字與底線，2～20 字元。' };
  if (password.trim().length < 4) return { success: false, message: '密碼長度至少 4 位！' };

  username = (username || '').replace(/<[^>]*>/g, '');
  password = (password || '').replace(/<[^>]*>/g, '');
  name = (name || '').replace(/<[^>]*>/g, '');

  const db = readDb();
  if (db[uKey]) {
    return { success: false, message: '此帳號已被註冊，請直接登入！' };
  }

  const newUser = {
    username: uKey,
    password: hashPassword(password.trim()),
    name: (name || '').trim() || '學生',
    courses: [],
    events: []
  };

  db[uKey] = newUser;
  writeDb(db);

  return {
    success: true,
    message: '註冊成功！已為您建立個人專屬課表。',
    user: { username: uKey, name: newUser.name },
    courses: [],
    events: []
  };
}

export function loginUser(username, password) {
  const uKey = (username || '').trim().toLowerCase();
  const pwd = (password || '').trim();

  if (!uKey || !pwd) return { success: false, message: '請輸入帳號與密碼！' };

  const db = readDb();
  const user = db[uKey];

  if (!user || user.password !== hashPassword(pwd)) {
    return { success: false, message: '帳號或密碼錯誤，請重新確認！' };
  }

  return {
    success: true,
    message: `歡迎回來，${user.name}！`,
    user: { username: user.username, name: user.name },
    courses: user.courses || [],
    events: user.events || []
  };
}

export function saveUserData(username, courses, events) {
  const uKey = (username || '').trim().toLowerCase();
  if (!uKey) return { success: false, message: '無效的使用者帳號' };

  const db = readDb();
  if (db[uKey]) {
    if (courses !== undefined) db[uKey].courses = courses;
    if (events !== undefined) db[uKey].events = events;
    writeDb(db);
  }

  return { success: true, message: '資料已成功儲存' };
}
