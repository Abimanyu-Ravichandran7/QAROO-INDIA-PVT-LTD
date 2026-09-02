import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import AdminNavbar from '../components/AdminNavbar.jsx';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);

  return (
    <div className={`admin-shell${mobileOpen ? ' sidebar-open' : ''}`}>
      <div className="admin-sidebar-backdrop" onClick={close} />
      <Sidebar onNavigate={close} />
      <div className="admin-main">
        <AdminNavbar onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
