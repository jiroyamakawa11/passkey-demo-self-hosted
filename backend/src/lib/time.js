/**
 * 現在時刻(ミリ秒)。
 * @returns {number}
 */
function nowMs() {
  return Date.now();
}

module.exports = {
  nowMs,
};
