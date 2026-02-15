// Passkey(credential) 永続化
const { getDb } = require('../db');

/**
 * userIdでPasskey取得。
 * @param {number} userId
 * @returns {Promise<any>}
 */
async function getByUserId(userId) {
  return getDb().get('SELECT * FROM credentials WHERE user_id = ?', userId);
}

/**
 * credentialIdで取得。
 * @param {string} credentialId
 * @returns {Promise<any>}
 */
async function getByCredentialId(credentialId) {
  return getDb().get(
    'SELECT * FROM credentials WHERE credential_id = ?',
    credentialId,
  );
}

/**
 * すべてのcredential一覧。
 * @returns {Promise<any[]>}
 */
async function listAll() {
  return getDb().all('SELECT credential_id, transports FROM credentials');
}

/**
 * Passkey作成。
 * @param {{userId: number, credentialId: string, publicKey: string, counter: number, transports: string | null, createdAt: number}} params
 * @returns {Promise<{lastID: number | null}>}
 */
async function create({ userId, credentialId, publicKey, counter, transports, createdAt }) {
  return getDb().run(
    'INSERT INTO credentials (user_id, credential_id, public_key, counter, transports, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    userId,
    credentialId,
    publicKey,
    counter,
    transports,
    createdAt,
  );
}

/**
 * カウンター更新。
 * @param {number} id
 * @param {number} newCounter
 * @returns {Promise<{lastID: number | null}>}
 */
async function updateCounter(id, newCounter) {
  return getDb().run(
    'UPDATE credentials SET counter = ? WHERE id = ?',
    newCounter,
    id,
  );
}

/**
 * userIdで削除。
 * @param {number} userId
 * @returns {Promise<{lastID: number | null}>}
 */
async function deleteByUserId(userId) {
  return getDb().run('DELETE FROM credentials WHERE user_id = ?', userId);
}

module.exports = {
  getByUserId,
  getByCredentialId,
  listAll,
  create,
  updateCounter,
  deleteByUserId,
};
