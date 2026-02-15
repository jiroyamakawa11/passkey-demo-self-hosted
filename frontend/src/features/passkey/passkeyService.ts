import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { apiPost } from '../../api/http';

/**
 * Passkey登録フロー。
 */
export async function registerPasskey(): Promise<void> {
  // 認証サーバへ登録を要求
  const options = await apiPost('/api/passkey/registration/start');
  // 受け取ったチャレンジでブラウザに認証情報作成要求
  const attResp = await startRegistration(options as Parameters<typeof startRegistration>[0]);
  // 署名したチャレンジ＋公開鍵を認証サーバに送付
  await apiPost('/api/passkey/registration/finish', attResp);
}

/**
 * Passkeyログインフロー。
 */
export async function loginWithPasskey(): Promise<void> {
  // 認証サーバへログイン要求
  const options = await apiPost('/api/passkey/authentication/start');
  // 受け取ったチャレンジでブラウザに認証要求
  const authResp = await startAuthentication(options as Parameters<typeof startAuthentication>[0]);
  // 署名したチャレンジを認証サーバに送付
  await apiPost('/api/passkey/authentication/finish', authResp);
}

/**
 * Passkey削除。
 */
export async function deletePasskey(): Promise<void> {
  await apiPost('/api/passkey/delete');
}
