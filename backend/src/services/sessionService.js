const { sessionCookieName, sessionMaxAgeMs } = require('../config');
const { nowMs } = require('../lib/time');
const { randomId } = require('../lib/ids');
const sessionRepository = require('../repositories/sessionRepository');

/**
 * セッションCookieの設定。
 * @param {import('express').Response} res
 * @param {string} sid
 * @returns {void}
 */
function setSessionCookie(res, sid) {
  res.cookie(sessionCookieName, sid, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: sessionMaxAgeMs,
  });
}

/**
 * 新規セッション作成。
 * @param {number | null} [userId=null]
 * @returns {Promise<{id: string, userId: number | null, challenge: string | null, challengeType: string | null, reauthUntil: number | null, expiresAt: number}>}
 */
async function createSession(userId = null) {
  const session = {
    id: randomId(),
    userId,
    challenge: null,
    challengeType: null,
    reauthUntil: null,
    expiresAt: nowMs() + sessionMaxAgeMs,
  };
  await sessionRepository.create(session);
  return session;
}

/**
 * セッション取得と期限切れ処理。
 * @param {string} sid
 * @returns {Promise<null | {id: string, userId: number | null, challenge: string | null, challengeType: string | null, reauthUntil: number | null, expiresAt: number}>}
 */
async function getSession(sid) {
  if (!sid) return null;
  const row = await sessionRepository.getById(sid);
  if (!row) return null;
  if (row.expires_at && row.expires_at < nowMs()) {
    await sessionRepository.deleteById(sid);
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    challenge: row.challenge,
    challengeType: row.challenge_type,
    expiresAt: row.expires_at,
    reauthUntil: row.reauth_until ?? null,
  };
}

/**
 * セッション更新。
 * @param {{id: string, userId: number | null, challenge: string | null, challengeType: string | null, reauthUntil: number | null, expiresAt: number}} session
 * @returns {Promise<void>}
 */
async function updateSession(session) {
  await sessionRepository.update(session);
}

/**
 * セッション削除。
 * @param {{id: string}} session
 * @returns {Promise<void>}
 */
async function clearSession(session) {
  await sessionRepository.deleteById(session.id);
}

/**
 * セッションIDをローテーションしてセッション固定を防止。
 * @param {{id: string, userId: number | null}} session
 * @returns {Promise<{id: string, userId: number | null, challenge: string | null, challengeType: string | null, reauthUntil: number | null, expiresAt: number}>}
 */
async function rotateSession(session) {
  const newSession = await createSession(session.userId);
  await clearSession(session);
  return newSession;
}

module.exports = {
  setSessionCookie,
  createSession,
  getSession,
  updateSession,
  clearSession,
  rotateSession,
};
