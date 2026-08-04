import { getDb } from './utils/db.js';
import { respond } from './utils/helpers.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') return respond(405, { success: false, message: 'Method not allowed' });

  try {
    const db = await getDb();
    const allUsers = await db.collection('users').find({}).project({ password: 0 }).toArray();

    const users = allUsers.map(u => ({
      username: u.username,
      name: u.name,
      coursesCount: (u.courses || []).length,
      eventsCount: (u.events || []).length,
      courses: u.courses || [],
      events: u.events || []
    }));

    return respond(200, { success: true, users });
  } catch (err) {
    console.error('[admin-users]', err);
    return respond(500, { success: false, message: '伺服器錯誤' });
  }
};
