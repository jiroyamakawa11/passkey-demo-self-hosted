# Passkey Demo Self-Hosted WebAuthn

IdPを使わずにパスキーを自前実装する最小構成のデモアプリです。
React（Vite）+ Express と `@simplewebauthn` で構成しています。

学習・検証目的のため、本番運用に必要な要素はあえて省略しています。

## 機能

- ユーザー登録（メール送信なし）
- パスワードログイン
- Passkey登録（1ユーザー1つ）
- Passkeyログイン
- マイページでPasskey状態表示
- Passkey削除
- ログアウト
- Passkey操作時のパスワード再認証（短時間有効）

## 技術スタック

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- WebAuthn: `@simplewebauthn/server`
- DB: SQLite（`sql.js`）
- Session: HttpOnly Cookie

## 設計メモ

- Vite Proxy でOriginを統一（CORS未使用）
- RP ID: `localhost`
- 学習目的の構成（本番考慮なし）

## 構成

```
backend/
  src/
    app.js
    server.js
    routes/
    controllers/
    services/
    repositories/
    middleware/
    db/
frontend/
  src/
    pages/
    components/
    features/
```

## 起動方法

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

ブラウザで以下を開きます:

```
http://localhost:5173
```

## 注意事項 / 制限

- Attestationは省略しています
- アカウント回復フローなし
- 1ユーザー1Passkey
- 本番向けのセキュリティ/監視/スケールは未対応

## ライセンス

MIT（`LICENSE` を参照）
