import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUnreadMessages } from '../hooks/useUnreadMessages.js';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '▦', permission: 'dashboard.view' },
  { to: '/admin/mous', label: 'MOU Directory', icon: 'M', permission: 'mou.read' },
  { to: '/admin/csr', label: 'CSR Projects', icon: 'C', permission: 'csr.read' },
  { to: '/admin/learning', label: 'Learning Programs', icon: 'L', permission: 'learning.read' },
  { to: '/admin/business-solutions', label: 'Business Solutions', icon: 'B', permission: 'business.read' },
  { to: '/admin/content', label: 'Website Content', icon: '◎', permission: 'home.update' },
  { to: '/admin/messages', label: 'Messages', icon: '✉', permission: 'contact.read' },
  { to: '/admin/admins', label: 'Admins', icon: '👤', permission: 'admin.read' },
];

export default function Sidebar({ onNavigate }) {
  const { hasPermission } = useAuth();
  const { unread } = useUnreadMessages();

  const visible = items.filter((it) => hasPermission(it.permission));
  // If none visible, still show dashboard for superadmin-like access
  if (visible.length === 0) visible.push(items[0]);

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <img
          src="/logos/qaroo-logo.jpg"
          alt="Qaroo India"
          style={{ height: '34px', width: 'auto', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '5px 10px' }}
        />
        <div>
          <strong>Qaroo India</strong>
          <span className="admin-sub">Private Limited</span>
        </div>
      </div>
      <nav className="admin-sidebar-nav">
        {visible.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={({ isActive }) => 'admin-nav-link' + (isActive ? ' active' : '')}
          >
            <span className="admin-nav-icon">{it.icon}</span>
            {it.label}
            {it.to === '/admin/messages' && unread > 0 && (
              <span className="admin-nav-badge">{unread}</span>
            )}
          </NavLink>
        ))}
        <NavLink
          to="/admin/change-password"
          onClick={onNavigate}
          className={({ isActive }) => 'admin-nav-link' + (isActive ? ' active' : '')}
        >
          <span className="admin-nav-icon">⌂</span>
          Change Password
        </NavLink>
      </nav>
    </aside>
  );
}
