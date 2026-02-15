import { apiGet } from '../../api/http';
import type { MeResponse } from './types';

/**
 * セッション状態を取得する。
 */
export async function fetchMe(): Promise<MeResponse> {
  return apiGet<MeResponse>('/api/me');
}
