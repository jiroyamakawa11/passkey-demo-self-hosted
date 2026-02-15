type Props = {
  busy: boolean;
  onPasskeyLogin: () => void;
};

/**
 * Topページ。
 */
export default function TopPage({ busy, onPasskeyLogin }: Props) {
  return (
    <section className="panel">
      <h2>Top</h2>
      <p>
        Passkeyのデモ用アプリです。まずは登録またはログインしてください。
        Passkeyログインは登録済みの場合に利用できます。
      </p>
      <div className="actions">
        <button onClick={onPasskeyLogin} disabled={busy}>
          Passkeyログイン
        </button>
      </div>
    </section>
  );
}
