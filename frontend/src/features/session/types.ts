/**
 * ログインユーザー。
 */
export type User = {
  id: number;
  username: string;
};

/**
 * /api/me のレスポンス。
 */
export type MeResponse = {
  user: User | null;
  hasPasskey: boolean;
  reauthActive: boolean;
  reauthUntil: number | null;
};
