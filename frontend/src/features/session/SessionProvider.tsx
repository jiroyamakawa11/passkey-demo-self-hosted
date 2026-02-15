import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from './sessionApi';
import type { MeResponse } from './types';

type SessionContextValue = {
  me: MeResponse;
  refresh: () => Promise<void>;
};

const initialMe: MeResponse = {
  user: null,
  hasPasskey: false,
  reauthActive: false,
  reauthUntil: null,
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * セッション状態を配布するプロバイダ。
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeResponse>(initialMe);

  const refresh = useCallback(async () => {
    const data = await fetchMe();
    setMe(data);
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const value = useMemo(() => ({ me, refresh }), [me, refresh]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * セッション状態を取得するフック。
 */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('SessionProvider is missing');
  }
  return ctx;
}
