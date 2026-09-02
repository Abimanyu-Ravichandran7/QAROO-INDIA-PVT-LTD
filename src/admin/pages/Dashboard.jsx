import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { mouApi } from '../../api/mouApi.js';
import { csrApi } from '../../api/csrApi.js';
import { learningApi } from '../../api/learningApi.js';
import { contactApi } from '../../api/contactApi.js';
import { adminApi } from '../../api/adminApi.js';
import { useUnreadMessages } from '../hooks/useUnreadMessages.js';
import { useToast } from '../../context/ToastContext';

export default function Dashboard() {
  const { admin, hasPermission } = useAuth();
  const { unread } = useUnreadMessages();
  const toast = useToast();
  const [onboardDismissed, setOnboardDismissed] = useState(() => {
    try { return localStorage.getItem('qaroo_onboarding_dismissed') === '1'; } catch { return false; }
  });
  const [stats, setStats] = useState({
    mous: 0,
    csr: 0,
    learning: 0,
    messages: 0,
    admins: 0,
  });
  const [statsError, setStatsError] = useState(false);

  const can = hasPermission;
  const isSuper = admin?.role === 'superadmin';

  const loadStats = useCallback(async () => {
    setStatsError(false);
    const next = { mous: 0, csr: 0, learning: 0, messages: 0, admins: 0 };
    let failed = false;
    try {
      const calls = [];
      if (can('mou.read')) calls.push(mouApi.list({}).then((r) => { next.mous = r.count || 0; }));
      if (can('csr.read')) calls.push(csrApi.list({}).then((r) => { next.csr = r.count || 0; }));
      if (can('learning.read')) calls.push(learningApi.list({}).then((r) => { next.learning = r.count || 0; }));
      if (can('contact.read')) calls.push(contactApi.list({}).then((r) => { next.messages = r.count || 0; }));
      if (isSuper) calls.push(adminApi.list().then((r) => { next.admins = r.data?.admins?.length || 0; }).catch(() => { failed = true; }));
      await Promise.all(calls);
      setStats(next);
    } catch {
      failed = true;
    }
    if (failed) {
      setStatsError(true);
      toast.error('Some dashboard stats could not be loaded. Click retry to try again.');
    }
  }, [can, isSuper, toast]);

  useEffect(() => { loadStats(); }, [loadStats]);

  return (
    <>
      <h1>Welcome back, {admin?.name}</h1>
      <p className="page-sub">
        {admin?.role === 'superadmin' ? 'Super Admin' : 'Admin'} overview of the Qaroo India Private Limited CMS.
      </p>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="num">{stats.mous}</div>
          <div className="label">Total MOUs</div>
        </div>
        <div className="admin-stat">
          <div className="num">{stats.messages}</div>
          <div className="label">Contact Messages</div>
        </div>
        <div className="admin-stat">
          <div className="num">{stats.csr}</div>
          <div className="label">CSR Projects</div>
        </div>
        <div className="admin-stat">
          <div className="num">{stats.learning}</div>
          <div className="label">Learning Programs</div>
        </div>
        {isSuper && (
          <div className="admin-stat">
            <div className="num">{stats.admins}</div>
            <div className="label">Admins</div>
          </div>
        )}
      </div>

      {statsError && (
        <div className="admin-alert error" style={{ marginTop: '16px' }}>
          Could not load all dashboard stats.
          <button className="admin-btn" style={{ marginLeft: '10px' }} onClick={loadStats}>Retry</button>
        </div>
      )}

      <div className="admin-card" style={{ marginTop: '22px' }}>
        <h2>Quick Actions</h2>
        <div className="admin-quick">
          {can('mou.create') && <Link to="/admin/mous/create">+ Add MOU</Link>}
          {can('mou.read') && <Link to="/admin/mous">Manage MOUs</Link>}
          {can('csr.read') && <Link to="/admin/csr">Manage CSR Projects</Link>}
          {can('learning.read') && <Link to="/admin/learning">Manage Learning Programs</Link>}
          {can('home.update') && <Link to="/admin/content">Manage Website Content</Link>}
          {can('contact.read') && <Link to="/admin/messages">Contact Messages{unread > 0 ? ` (${unread} new)` : ''}</Link>}
          {isSuper && <Link to="/admin/admins">Manage Admins</Link>}
        </div>
      </div>

      {isSuper && !onboardDismissed && (stats.mous === 0 || stats.csr === 0 || stats.learning === 0) && (
        <div className="admin-card" style={{ marginTop: '22px' }}>
          <div className="admin-section-title">
            <span>Getting started</span>
            <button className="admin-icon-btn" onClick={() => { try { localStorage.setItem('qaroo_onboarding_dismissed', '1'); } catch {} setOnboardDismissed(true); }}>
              Dismiss
            </button>
          </div>
          <p className="hint" style={{ marginBottom: '12px' }}>A few quick wins to make the public site shine:</p>
          <ol style={{ margin: '0 0 0 20px', padding: 0, fontSize: '14.5px', lineHeight: 2 }}>
            {stats.learning === 0 && <li><Link to="/admin/learning/create">Add your first learning program (career tracks)</Link></li>}
            {stats.csr === 0 && <li><Link to="/admin/csr/create">Add your first CSR project</Link></li>}
            {stats.mous === 0 && <li><Link to="/admin/mous/create">Add your first MOU for the public directory</Link></li>}
            {stats.mous > 0 && <li><span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> MOUs published</li>}
            {stats.csr > 0 && <li><span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> CSR projects published</li>}
            {stats.learning > 0 && <li><span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> Learning programs published</li>}
          </ol>
          <p className="hint" style={{ margin: '12px 0 0' }}>
            Tip: set <code>EMAIL_HOST</code>, <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> in{' '}
            <code>backend/.env</code> so signup-verification and password-reset emails are actually delivered.
          </p>
        </div>
      )}
    </>
  );
}
