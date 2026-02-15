/**
 * 補足情報パネル。
 */
export default function InfoPanel() {
  return (
    <section className="panel">
      <h2>補足</h2>
      <ul>
        <li>RP ID は localhost 固定です。</li>
        <li>Vite Proxy を使い、Origin を揃えています。</li>
        <li>本番用の回復/多端末対応は省略しています。</li>
      </ul>
    </section>
  );
}
