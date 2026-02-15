import { useState } from 'react';

type Props = {
  busy: boolean;
  onLogin: (username: string, password: string) => void;
  onPasskeyLogin: () => void;
};

/**
 * ログインページ。
 */
export default function LoginPage({ busy, onLogin, onPasskeyLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <section className="panel">
      <h2>ログイン</h2>
      <div className="form">
        <label>
          ユーザー名
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </label>
        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </label>
        <div className="actions">
          <button onClick={() => onLogin(username, password)} disabled={busy}>
            パスワードでログイン
          </button>
          <button onClick={onPasskeyLogin} disabled={busy}>
            Passkeyログイン
          </button>
        </div>
      </div>
    </section>
  );
}
