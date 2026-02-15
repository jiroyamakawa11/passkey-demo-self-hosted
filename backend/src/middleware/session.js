const { sessionCookieName } = require('../config');
const sessionService = require('../services/sessionService');

/**
 * すべてのリクエストにセッションを付与。
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
async function sessionMiddleware(req, res, next) {
  const sid = req.cookies?.[sessionCookieName];
  let session = await sessionService.getSession(sid);
  if (!session) {
    session = await sessionService.createSession();
    sessionService.setSessionCookie(res, session.id);
  }
  req.session = session;
  next();
}

module.exports = {
  sessionMiddleware,
};
