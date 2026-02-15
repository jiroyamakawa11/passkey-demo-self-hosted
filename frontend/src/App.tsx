import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HeroHeader from './components/HeroHeader';
import InfoPanel from './components/InfoPanel';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import RegisterPage from './pages/RegisterPage';
import TopPage from './pages/TopPage';
import { useSession } from './features/session/SessionProvider';
import * as authService from './features/auth/authService';
import * as passkeyService from './features/passkey/passkeyService';

export default function App() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { me, refresh } = useSession();
  const isMypage = location.pathname.startsWith('/me');

  useEffect(() => {
    if (location.pathname === '/me' && !me.user) {
      navigate('/login');
    }
  }, [location.pathname, me.user, navigate]);

  const runAction = async (action: () => Promise<void>, message: string) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      alert(`${message}: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (username: string, password: string) => {
    await runAction(async () => {
      await authService.register(username, password);
      await refresh();
      navigate('/me');
    }, '登録に失敗しました');
  };

  const handleLogin = async (username: string, password: string) => {
    await runAction(async () => {
      await authService.login(username, password);
      await refresh();
      navigate('/me');
    }, 'ログインに失敗しました');
  };

  const handleLogout = async () => {
    await runAction(async () => {
      await authService.logout();
      await refresh();
      navigate('/');
    }, 'ログアウトに失敗しました');
  };

  const handlePasskeyRegister = async () => {
    await runAction(async () => {
      await passkeyService.registerPasskey();
      await refresh();
    }, 'Passkey登録に失敗しました');
  };

  const handlePasskeyLogin = async () => {
    await runAction(async () => {
      await passkeyService.loginWithPasskey();
      await refresh();
      navigate('/me');
    }, 'Passkeyログインに失敗しました');
  };

  const handlePasskeyDelete = async () => {
    await runAction(async () => {
      await passkeyService.deletePasskey();
      await refresh();
    }, 'Passkey削除に失敗しました');
  };

  const handleReauth = async (password: string) => {
    await runAction(async () => {
      await authService.reauth(password);
      await refresh();
    }, 'パスワード確認に失敗しました');
  };

  return (
    <div className="page">
      <HeroHeader me={me} />
      <NavBar isAuthenticated={Boolean(me.user)} />

      <Routes>
        <Route path="/" element={<TopPage busy={busy} onPasskeyLogin={handlePasskeyLogin} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              busy={busy}
              onLogin={handleLogin}
              onPasskeyLogin={handlePasskeyLogin}
            />
          }
        />
        <Route
          path="/register"
          element={<RegisterPage busy={busy} onRegister={handleRegister} />}
        />
        <Route
          path="/me"
          element={
            <MyPage
              me={me}
              busy={busy}
              onReauth={handleReauth}
              onPasskeyRegister={handlePasskeyRegister}
              onPasskeyDelete={handlePasskeyDelete}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>

      {!isMypage && <InfoPanel />}
    </div>
  );
}
