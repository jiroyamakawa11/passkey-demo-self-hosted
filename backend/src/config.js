// 設定値はここに集約
module.exports = {
  port: 3001,
  rpID: 'localhost',
  expectedOrigin: 'http://localhost:5173',
  sessionCookieName: 'sid',
  sessionMaxAgeMs: 1000 * 60 * 60 * 24 * 7,
  reauthWindowMs: 1000 * 60 * 5,
};
