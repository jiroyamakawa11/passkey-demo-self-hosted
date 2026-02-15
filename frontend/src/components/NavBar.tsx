import { Link } from 'react-router-dom';

type Props = {
  isAuthenticated: boolean;
};

/**
 * ログイン状態に応じたナビゲーション。
 */
export default function NavBar({ isAuthenticated }: Props) {
  return (
    <nav className="panel nav">
      {!isAuthenticated && (
        <>
          <Link to="/">Top</Link>
          <Link to="/login">ログイン</Link>
          <Link to="/register">登録</Link>
        </>
      )}
      {isAuthenticated && <Link to="/me">マイページ</Link>}
    </nav>
  );
}
