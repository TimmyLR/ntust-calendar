const { respond } = require('./utils/helpers');

exports.handler = async () => {
  return respond(200, {
    status: 'ok',
    time: new Date().toISOString(),
    app: 'NTUST Student Calendar API (Netlify Functions)',
    db: process.env.MONGODB_URI ? 'MongoDB Atlas configured' : 'No database configured'
  });
};
