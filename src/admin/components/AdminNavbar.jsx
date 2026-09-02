import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUnreadMessages } from '../hooks/useUnreadMessages.js';
import { useAdminTheme } from '../context/AdminThemeContext.jsx';

export default function AdminNavbar({ onMenuClick }) {
  const { admin, logout, hasPermission } = useAuth();
  const { theme, toggle } = useAdminTheme();
  const navigate = useNavigate();
  const { unread } = useUnreadMessages();
  const inBeta = import.meta.env.VITE_BETA_MODE === 'true';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="admin-topbar">
      <button className="admin-menu-btn" onClick={onMenuClick} aria-label="Toggle navigation menu">☰</button>
      <div className="admin-topbar-title">Admin Panel</div>
      <div className="admin-topbar-right">
        {inBeta && <span className="admin-badge yellow" title="Beta build — set VITE_BETA_MODE=true in your .env to show/hide">Beta</span>}
        <button
          className="admin-theme-toggle"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark'
            ? <span aria-hidden="true">☀️</span>
            : <span aria-hidden="true">🌙</span>}
        </button>
        {hasPermission('contact.read') && unread > 0 && (
          <Link
            to="/admin/messages"
            className="admin-outline-btn"
            title={`${unread} new message${unread > 1 ? 's' : ''}`}
            aria-label={`${unread} new message${unread > 1 ? 's' : ''}`}
          >
            ✉ <span className="admin-nav-badge">{unread}</span>
          </Link>
        )}
        <Link to="/" target="_blank" className="admin-outline-btn">View Website</Link>
        <div className="admin-user">
          <span className="admin-avatar">{admin?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
          <div className="admin-user-meta">
            <strong>{admin?.name}</strong>
            <span>{admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-danger-btn">Logout</button>
      </div>
    </header>
  );
}
