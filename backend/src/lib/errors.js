/**
 * エラーをHTTPレスポンス用に整形する。
 * @param {number} status
 * @param {string} code
 * @returns {Error}
 */
function httpError(status, code) {
  const err = new Error(code);
  err.status = status;
  err.code = code;
  return err;
}

/**
 * コントローラ共通のエラーハンドラ。
 * @param {import('express').Response} res
 * @param {Error & {status?: number, code?: string}} err
 * @returns {import('express').Response}
 */
function handleError(res, err) {
  const status = err.status || 500;
  const code = err.code || 'server_error';
  return res.status(status).json({ ok: false, error: code });
}

module.exports = {
  httpError,
  handleError,
};
