// ユーザー永続化
const { getDb } = require('../db');

/**
 * IDでユーザー取得。
 * @param {number} id
 * @returns {Promise<any>}
 */
async function getById(id) {
  return getDb().get('SELECT * FROM users WHERE id = ?', id);
}

/**
 * usernameでユーザー取得。
 * @param {string} username
 * @returns {Promise<any>}
 */
async function getByUsername(username) {
  return getDb().get('SELECT * FROM users WHERE username = ?', username);
}

/**
 * ユーザー作成。
 * @param {{username: string, passwordHash: string, userHandle: string}} params
 * @returns {Promise<{lastID: number | null}>}
 */
async function create({ username, passwordHash, userHandle }) {
  return getDb().run(
    'INSERT INTO users (username, password_hash, user_handle) VALUES (?, ?, ?)',
    username,
    passwordHash,
    userHandle,
  );
}

module.exports = {
  getById,
  getByUsername,
  create,
};
