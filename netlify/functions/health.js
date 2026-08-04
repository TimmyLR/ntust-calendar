import { respond } from './utils/helpers.js';

export const handler = async () => {
  return respond(200, {
    status: 'ok',
    time: new Date().toISOString(),
    app: 'NTUST Student Calendar API (Netlify Functions)',
    db: process.env.MONGODB_URI ? 'MongoDB Atlas configured' : 'No database configured'
  });
};
