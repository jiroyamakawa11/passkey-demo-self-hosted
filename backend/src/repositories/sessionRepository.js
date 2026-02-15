// セッション永続化
const { getDb } = require('../db');

/**
 * セッション作成。
 * @param {{id: string, userId: number | null, expiresAt: number, reauthUntil: number | null, challenge: string | null, challengeType: string | null}} session
 * @returns {Promise<{lastID: number | null}>}
 */
async function create(session) {
  return getDb().run(
    'INSERT INTO sessions (id, user_id, expires_at, reauth_until, challenge, challenge_type) VALUES (?, ?, ?, ?, ?, ?)',
    session.id,
    session.userId,
    session.expiresAt,
    session.reauthUntil,
    session.challenge,
    session.challengeType,
  );
}

/**
 * IDでセッション取得。
 * @param {string} id
 * @returns {Promise<any>}
 */
async function getById(id) {
  return getDb().get('SELECT * FROM sessions WHERE id = ?', id);
}

/**
 * セッション更新。
 * @param {{id: string, userId: number | null, expiresAt: number, reauthUntil: number | null, challenge: string | null, challengeType: string | null}} session
 * @returns {Promise<{lastID: number | null}>}
 */
async function update(session) {
  return getDb().run(
    'UPDATE sessions SET user_id = ?, challenge = ?, challenge_type = ?, expires_at = ?, reauth_until = ? WHERE id = ?',
    session.userId,
    session.challenge,
    session.challengeType,
    session.expiresAt,
    session.reauthUntil,
    session.id,
  );
}

/**
 * セッション削除。
 * @param {string} id
 * @returns {Promise<{lastID: number | null}>}
 */
async function deleteById(id) {
  return getDb().run('DELETE FROM sessions WHERE id = ?', id);
}

module.exports = {
  create,
  getById,
  update,
  deleteById,
};
