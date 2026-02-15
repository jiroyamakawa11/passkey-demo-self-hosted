/**
 * JSON POSTリクエスト共通処理。
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : '{}',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'request_failed');
  }
  return data as T;
}

/**
 * JSON GETリクエスト共通処理。
 */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'request_failed');
  }
  return data as T;
}
