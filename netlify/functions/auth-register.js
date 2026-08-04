import { getDb } from './utils/db.js';
import { hashPassword, sanitize, respond } from './utils/helpers.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const { username, password, name } = JSON.parse(event.body || '{}');
    const uKey = sanitize(username).toLowerCase();
    const pwd = sanitize(password);
    const displayName = sanitize(name) || '學生';

    if (!uKey || !pwd) return respond(400, { success: false, message: '請輸入帳號與密碼！' });
    if (!/^[a-zA-Z0-9_]{2,20}$/.test(uKey)) return respond(400, { success: false, message: '帳號僅允許英文、數字與底線，2～20 字元。' });
    if (pwd.length < 4) return respond(400, { success: false, message: '密碼長度至少 4 位！' });

    const db = await getDb();
    const users = db.collection('users');

    const existing = await users.findOne({ username: uKey });
    if (existing) return respond(400, { success: false, message: '此帳號已被註冊，請直接登入！' });

    await users.insertOne({
      username: uKey,
      password: hashPassword(pwd),
      name: displayName,
      courses: [],
      events: [],
      createdAt: new Date().toISOString()
    });

    return respond(200, {
      success: true,
      message: '註冊成功！已為您建立個人專屬課表。',
      user: { username: uKey, name: displayName },
      courses: [],
      events: []
    });
  } catch (err) {
    console.error('[auth-register]', err);
    return respond(500, { success: false, message: '伺服器錯誤，請稍後再試。' });
  }
};
