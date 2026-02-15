const { nowMs } = require('../lib/time');

/**
 * ログイン済みかをチェック。
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {import('express').Response | void}
 */
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ ok: false, error: 'not_authenticated' });
  }
  return next();
}

/**
 * 再認証済みかをチェック。
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {import('express').Response | void}
 */
function requireReauth(req, res, next) {
  if (!req.session?.reauthUntil || req.session.reauthUntil < nowMs()) {
    return res.status(403).json({ ok: false, error: 'reauth_required' });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireReauth,
};
