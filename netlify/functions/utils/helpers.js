import crypto from 'crypto';

export function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export function sanitize(str) {
  return (str || '').replace(/<[^>]*>/g, '').trim();
}

export function respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
    body: JSON.stringify(body),
  };
}
