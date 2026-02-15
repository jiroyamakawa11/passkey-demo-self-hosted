import { useState } from 'react';
import type { MeResponse } from '../features/session/types';

type Props = {
  me: MeResponse;
  busy: boolean;
  onReauth: (password: string) => void;
  onPasskeyRegister: () => void;
  onPasskeyDelete: () => void;
  onLogout: () => void;
};

/**
 * マイページ。
 */
export default function MyPage({
  me,
  busy,
  onReauth,
  onPasskeyRegister,
  onPasskeyDelete,
  onLogout,
}: Props) {
  const [reauthPassword, setReauthPassword] = useState('');

  if (!me.user) {
    return (
      <section className="panel">
        <h2>マイページ</h2>
        <p>ログインしてください。</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>マイページ</h2>
      <p>{me.user.username} さんとしてログイン中です。</p>
      <p>
        1ユーザー1つのPasskeyのみを許可しています。
        未登録なら登録、登録済みなら削除できます。
      </p>
      <div className="form">
        <label>
          Passkey操作のためのパスワード確認
          <input
            type="password"
            value={reauthPassword}
            onChange={(e) => setReauthPassword(e.target.value)}
            placeholder="password"
          />
        </label>
        <div className="actions">
          <button onClick={() => onReauth(reauthPassword)} disabled={busy || !reauthPassword}>
            パスワード確認
          </button>
          <span className="status-pill">
            {me.reauthActive ? '確認済み (5分間有効)' : '未確認'}
          </span>
        </div>
      </div>
      <div className="actions">
        <button
          onClick={onPasskeyRegister}
          disabled={busy || me.hasPasskey || !me.reauthActive}
        >
          Passkey登録
        </button>
        <button
          onClick={onPasskeyDelete}
          disabled={busy || !me.hasPasskey || !me.reauthActive}
        >
          Passkey削除
        </button>
        <button onClick={onLogout} disabled={busy}>
          ログアウト
        </button>
      </div>
    </section>
  );
}
