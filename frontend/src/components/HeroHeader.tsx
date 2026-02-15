import { useMemo } from 'react';
import type { MeResponse } from '../features/session/types';

type Props = {
  me: MeResponse;
};

/**
 * 画面上部の説明とステータス表示。
 */
export default function HeroHeader({ me }: Props) {
  const statusText = useMemo(() => {
    if (!me.user) return '未ログイン';
    return `ログイン中: ${me.user.username}`;
  }, [me.user]);

  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Passkey Demo</p>
        <h1>IdPなしの最小構成 WebAuthn</h1>
        <p className="lede">
          パスワードとPasskeyの両方を体験し、
          自前実装の難所を確認するためのデモです。
        </p>
      </div>
      <div className="status">
        <span>ログイン状態</span>
        <strong>{statusText}</strong>
        <span>Passkey</span>
        <strong>{me.hasPasskey ? '登録済み' : '未登録'}</strong>
      </div>
    </header>
  );
}
