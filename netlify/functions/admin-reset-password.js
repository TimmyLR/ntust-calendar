const { getDb } = require('./utils/db');
const { hashPassword, respond } = require('./utils/helpers');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const { username, newPassword } = JSON.parse(event.body || '{}');
    if (!username || !newPassword) return respond(400, { success: false, message: 'Missing fields' });

    const db = await getDb();
    const result = await db.collection('users').updateOne(
      { username },
      { $set: { password: hashPassword(newPassword.trim()) } }
    );

    if (result.matchedCount === 0) return respond(404, { success: false, message: '找不到該帳號' });
    return respond(200, { success: true, message: `已重設 ${username} 的密碼` });
  } catch (err) {
    console.error('[admin-reset-password]', err);
    return respond(500, { success: false, message: '伺服器錯誤' });
  }
};
