const crypto = require('crypto');

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

function sanitize(str) {
  return (str || '').replace(/<[^>]*>/g, '').trim();
}

function headers(statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  };
}

function respond(statusCode, body) {
  return {
    ...headers(statusCode),
    body: JSON.stringify(body),
  };
}

module.exports = { hashPassword, sanitize, respond };
