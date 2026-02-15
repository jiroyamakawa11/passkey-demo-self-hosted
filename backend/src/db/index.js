// sql.js を使った簡易DBラッパ
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let dbInstance;

/**
 * DBの初期化とスキーマ作成。
 * @returns {Promise<{exec: Function, run: Function, get: Function, all: Function}>}
 */
async function initDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', '..', 'db.sqlite');
  const sqlDb = fs.existsSync(dbPath)
    ? new SQL.Database(new Uint8Array(fs.readFileSync(dbPath)))
    : new SQL.Database();

  // ファイルへ永続化
  /**
   * ファイルへ永続化する。
   * @returns {void}
   */
  const persist = () => {
    const data = sqlDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  };

  // DDLなどの実行
  /**
   * DDLなどの実行。
   * @param {string} sql
   * @returns {void}
   */
  const exec = (sql) => {
    sqlDb.exec(sql);
    persist();
  };

  // 変更系SQL
  /**
   * 変更系SQLの実行。
   * @param {string} sql
   * @param {...any} params
   * @returns {{lastID: number | null}}
   */
  const run = (sql, ...params) => {
    const stmt = sqlDb.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    persist();
    const result = sqlDb.exec('SELECT last_insert_rowid() AS id');
    const lastID = result[0]?.values?.[0]?.[0] ?? null;
    return { lastID };
  };

  // 1件取得
  /**
   * 1件取得。
   * @param {string} sql
   * @param {...any} params
   * @returns {any}
   */
  const get = (sql, ...params) => {
    const stmt = sqlDb.prepare(sql);
    stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return row;
  };

  // 複数取得
  /**
   * 複数取得。
   * @param {string} sql
   * @param {...any} params
   * @returns {any[]}
   */
  const all = (sql, ...params) => {
    const stmt = sqlDb.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  };

  dbInstance = {
    exec,
    run,
    get,
    all,
  };

  // スキーマ初期化
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      user_handle TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      credential_id TEXT NOT NULL UNIQUE,
      public_key TEXT NOT NULL,
      counter INTEGER NOT NULL,
      transports TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      challenge TEXT,
      challenge_type TEXT,
      expires_at INTEGER,
      reauth_until INTEGER
    );
  `);

  ensureSessionColumns(dbInstance);
  return dbInstance;
}

/**
 * 既存DBへのマイグレーション対応。
 * @param {{all: Function, exec: Function}} db
 * @returns {void}
 */
function ensureSessionColumns(db) {
  // 既存DBへのマイグレーション対応
  const columns = db.all('PRAGMA table_info(sessions)') || [];
  const hasReauth = columns.some((col) => col.name === 'reauth_until');
  if (!hasReauth) {
    db.exec('ALTER TABLE sessions ADD COLUMN reauth_until INTEGER');
  }
}

/**
 * 初期化済みのDBインスタンス取得。
 * @returns {{exec: Function, run: Function, get: Function, all: Function}}
 */
function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance;
}

module.exports = {
  initDb,
  getDb,
};
