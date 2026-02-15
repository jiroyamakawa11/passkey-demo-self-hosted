const bcrypt = require('bcryptjs');
const { sessionMaxAgeMs, reauthWindowMs } = require('../config');
const { nowMs } = require('../lib/time');
const { randomId } = require('../lib/ids');
const { httpError } = require('../lib/errors');
const userRepository = require('../repositories/userRepository');
const credentialRepository = require('../repositories/credentialRepository');
const sessionService = require('./sessionService');

/**
 * マイページ表示用の状態取得。
 * @param {{userId: number | null, reauthUntil: number | null}} session
 * @returns {Promise<{user: {id: number, username: string} | null, hasPasskey: boolean, reauthActive: boolean, reauthUntil: number | null}>}
 */
async function getMe(session) {
  if (!session?.userId) {
    return { user: null, hasPasskey: false, reauthActive: false, reauthUntil: null };
  }
  const user = await userRepository.getById(session.userId);
  if (!user) {
    return { user: null, hasPasskey: false, reauthActive: false, reauthUntil: null };
  }
  const credential = await credentialRepository.getByUserId(user.id);
  const reauthActive = Boolean(session.reauthUntil && session.reauthUntil > nowMs());
  return {
    user: { id: user.id, username: user.username },
    hasPasskey: Boolean(credential),
    reauthActive,
    reauthUntil: session.reauthUntil ?? null,
  };
}

/**
 * ユーザー登録。
 * @param {{username?: string, password?: string, session: any}} params
 * @returns {Promise<void>}
 */
async function register({ username, password, session }) {
  if (!username || !password) {
    throw httpError(400, 'missing_fields');
  }
  const existing = await userRepository.getByUsername(username);
  if (existing) {
    throw httpError(409, 'user_exists');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const userHandle = randomId(16);
  const result = await userRepository.create({
    username,
    passwordHash,
    userHandle,
  });
  session.userId = result.lastID;
  session.expiresAt = nowMs() + sessionMaxAgeMs;
  session.reauthUntil = null;
  await sessionService.updateSession(session);
}

/**
 * パスワードログイン。
 * @param {{username?: string, password?: string, session: any}} params
 * @returns {Promise<void>}
 */
async function login({ username, password, session }) {
  if (!username || !password) {
    throw httpError(400, 'missing_fields');
  }
  const user = await userRepository.getByUsername(username);
  if (!user) {
    throw httpError(401, 'invalid_credentials');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw httpError(401, 'invalid_credentials');
  }
  session.userId = user.id;
  session.expiresAt = nowMs() + sessionMaxAgeMs;
  session.reauthUntil = null;
  await sessionService.updateSession(session);
}

/**
 * Passkey操作前の再認証。
 * @param {{password?: string, session: any}} params
 * @returns {Promise<{reauthUntil: number}>}
 */
async function reauth({ password, session }) {
  if (!password) {
    throw httpError(400, 'missing_password');
  }
  const user = await userRepository.getById(session.userId);
  if (!user) {
    throw httpError(404, 'user_not_found');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw httpError(401, 'invalid_password');
  }
  session.reauthUntil = nowMs() + reauthWindowMs;
  await sessionService.updateSession(session);
  return { reauthUntil: session.reauthUntil };
}

module.exports = {
  getMe,
  register,
  login,
  reauth,
};
