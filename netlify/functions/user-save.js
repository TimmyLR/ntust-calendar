const { getDb } = require('./utils/db');
const { sanitize, respond } = require('./utils/helpers');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const { username, courses, events } = JSON.parse(event.body || '{}');
    const uKey = sanitize(username).toLowerCase();

    if (!uKey) return respond(400, { success: false, message: '無效的使用者帳號' });
    if (courses && !Array.isArray(courses)) return respond(400, { success: false, message: 'Invalid data' });
    if (events && !Array.isArray(events)) return respond(400, { success: false, message: 'Invalid data' });

    const db = await getDb();
    const update = {};
    if (courses !== undefined) update.courses = courses;
    if (events !== undefined) update.events = events;

    await db.collection('users').updateOne(
      { username: uKey },
      { $set: update }
    );

    return respond(200, { success: true, message: '資料已成功儲存' });
  } catch (err) {
    console.error('[user-save]', err);
    return respond(500, { success: false, message: '伺服器錯誤，請稍後再試。' });
  }
};
