const crypto = require('crypto');
const { isoBase64URL } = require('@simplewebauthn/server/helpers');

/**
 * セッションIDなどのランダム生成。
 * @param {number} [bytes=24]
 * @returns {string}
 */
function randomId(bytes = 24) {
  return isoBase64URL.fromBuffer(crypto.randomBytes(bytes));
}

module.exports = {
  randomId,
};
