import { apiPost } from '../../api/http';

/**
 * パスワード登録。
 */
export async function register(username: string, password: string): Promise<void> {
  await apiPost('/api/register', { username, password });
}

/**
 * パスワードログイン。
 */
export async function login(username: string, password: string): Promise<void> {
  await apiPost('/api/login', { username, password });
}

/**
 * ログアウト。
 */
export async function logout(): Promise<void> {
  await apiPost('/api/logout');
}

/**
 * Passkey操作前の再認証。
 */
export async function reauth(password: string): Promise<void> {
  await apiPost('/api/reauth', { password });
}
