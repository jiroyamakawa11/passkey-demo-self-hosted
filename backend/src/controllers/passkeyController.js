const passkeyService = require('../services/passkeyService');
const sessionService = require('../services/sessionService');
const { handleError } = require('../lib/errors');

/**
 * POST /api/passkey/registration/start
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function startRegistration(req, res) {
  try {
    const options = await passkeyService.startRegistration(req.session);
    return res.json(options);
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/passkey/registration/finish
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function finishRegistration(req, res) {
  try {
    await passkeyService.finishRegistration(req.session, req.body);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/passkey/authentication/start
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function startAuthentication(req, res) {
  try {
    const options = await passkeyService.startAuthentication(req.session);
    return res.json(options);
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/passkey/authentication/finish
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function finishAuthentication(req, res) {
  try {
    await passkeyService.finishAuthentication(req.session, req.body);
    const newSession = await sessionService.rotateSession(req.session);
    req.session = newSession;
    sessionService.setSessionCookie(res, newSession.id);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

/**
 * POST /api/passkey/delete
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
async function deletePasskey(req, res) {
  try {
    await passkeyService.deletePasskey(req.session);
    return res.json({ ok: true });
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
  deletePasskey,
};
