import { getDb } from './utils/db.js';
import { hashPassword, sanitize, respond } from './utils/helpers.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const { username, password } = JSON.parse(event.body || '{}');
    const uKey = sanitize(username).toLowerCase();
    const pwd = sanitize(password);

    if (!uKey || !pwd) return respond(400, { success: false, message: '請輸入帳號與密碼！' });

    const db = await getDb();
    const user = await db.collection('users').findOne({ username: uKey });

    if (!user || user.password !== hashPassword(pwd)) {
      return respond(400, { success: false, message: '帳號或密碼錯誤，請重新確認！' });
    }

    return respond(200, {
      success: true,
      message: `歡迎回來，${user.name}！`,
      user: { username: user.username, name: user.name },
      courses: user.courses || [],
      events: user.events || []
    });
  } catch (err) {
    console.error('[auth-login]', err);
    return respond(500, { success: false, message: '伺服器錯誤，請稍後再試。' });
  }
};
