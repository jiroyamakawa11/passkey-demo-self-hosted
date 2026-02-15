import { useState } from 'react';

type Props = {
  busy: boolean;
  onRegister: (username: string, password: string) => void;
};

/**
 * 登録ページ。
 */
export default function RegisterPage({ busy, onRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <section className="panel">
      <h2>登録</h2>
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
          <button onClick={() => onRegister(username, password)} disabled={busy}>
            登録
          </button>
        </div>
      </div>
    </section>
  );
}
