import { getDb } from './utils/db.js';
import { respond } from './utils/helpers.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const { username } = JSON.parse(event.body || '{}');
    if (!username) return respond(400, { success: false, message: 'Missing username' });

    const db = await getDb();
    const result = await db.collection('users').deleteOne({ username });

    if (result.deletedCount === 0) return respond(404, { success: false, message: '找不到該帳號' });
    return respond(200, { success: true, message: `已刪除帳號：${username}` });
  } catch (err) {
    console.error('[admin-delete-user]', err);
    return respond(500, { success: false, message: '伺服器錯誤' });
  }
};
