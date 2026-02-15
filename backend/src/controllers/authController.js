const authService = require('../services/authService');
const sessionService = require('../services/sessionService');
const { sessionCookieName } = require('../config');
const { handleError } = require('../lib/errors');

/**
 * GET /api/me
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function me(req, res) {
  try {
    const data = await authService.getMe(req.session);
    return res.json(data);
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/register
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function register(req, res) {
  try {
    await authService.register({
      username: req.body?.username,
      password: req.body?.password,
      session: req.session,
    });
    const newSession = await sessionService.rotateSession(req.session);
    req.session = newSession;
    sessionService.setSessionCookie(res, newSession.id);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/login
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function login(req, res) {
  try {
    await authService.login({
      username: req.body?.username,
      password: req.body?.password,
      session: req.session,
    });
    const newSession = await sessionService.rotateSession(req.session);
    req.session = newSession;
    sessionService.setSessionCookie(res, newSession.id);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/logout
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function logout(req, res) {
  try {
    if (req.session) {
      await sessionService.clearSession(req.session);
    }
    res.clearCookie(sessionCookieName);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/reauth
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function reauth(req, res) {
  try {
    const result = await authService.reauth({
      password: req.body?.password,
      session: req.session,
    });
    return res.json({ ok: true, ...result });
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  me,
  register,
  login,
  logout,
  reauth,
};
