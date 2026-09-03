import { useState, useEffect, useCallback, useRef } from 'react';
import { contactApi } from '../../api/contactApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { ShimmerPanel, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function Messages() {
  const { hasPermission } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const toast = useToast();
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;
    return () => { unmounted.current = true; };
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await contactApi.list({ status: filter === 'all' ? undefined : filter });
      if (unmounted.current) return;
      setMessages(res.data.messages || []);
    } catch (err) {
      if (unmounted.current) return;
      setError(err?.message || 'Could not load messages.');
    } finally {
      if (!unmounted.current) setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleDelete = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await contactApi.remove(m._id);
      if (selected?._id === m._id) setSelected(null);
      toast.success('Message deleted.');
      fetchMessages();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
    }
  };
  const handleToggleRead = async (m) => {
    try {
      await contactApi.toggleRead(m._id);
      toast.success(m.status === 'read' ? 'Marked as new.' : 'Marked as read.');
      fetchMessages();
    } catch (err) {
      toast.error(err.message || 'Update failed. Please try again.');
    }
  };
  const handleResolve = async (m) => {
    try {
      await contactApi.resolve(m._id);
      toast.success('Message resolved.');
      fetchMessages();
    } catch (err) {
      toast.error(err.message || 'Update failed. Please try again.');
    }
  };

  const badge = (s) => ({ new: 'red', read: 'blue', resolved: 'green' }[s] || 'grey');
  const label = (s) => ({ new: 'New', read: 'Read', resolved: 'Resolved' }[s] || s);

  return (
    <PermissionGuard permission="contact.read">
      <h1>Contact Messages</h1>
      <p className="page-sub">Messages submitted through the website contact form.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {['all', 'new', 'read', 'resolved'].map((f) => (
          <button key={f} className={`admin-icon-btn ${filter === f ? 'active' : ''}`} style={filter === f ? { borderColor: 'var(--admin-base)', color: 'var(--admin-base)' } : {}}
            onClick={() => setFilter(f)}>{f === 'all' ? 'All' : label(f)}</button>
        ))}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>From</th><th>Subject</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5"><ShimmerPanel variant="table" header={false} /></td></tr>
            : error ? <tr><td colSpan="5"><ErrorState compact title="Couldn't load messages" text={error} onRetry={fetchMessages} /></td></tr>
            : messages.length === 0 ? <tr><td colSpan="5"><EmptyState compact title="No messages yet" text="Messages submitted through the website contact form will appear here." /></td></tr>
            : messages.map((m) => (
              <tr key={m._id}>
                <td>
                  <strong>{m.name}</strong><br />
                  <span style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>{m.email}</span>
                </td>
                <td>{m.interest || 'General'}</td>
                <td><span className={`admin-badge ${badge(m.status)}`}>{label(m.status)}</span></td>
                <td>{new Date(m.createdAt).toLocaleString()}</td>
                <td>
                  <div className="actions">
                    <button className="admin-icon-btn act-view" onClick={() => setSelected(m)}>View</button>
                    {hasPermission('contact.read') && <button className="admin-icon-btn act-mark" onClick={() => handleToggleRead(m)}>{m.status === 'read' ? 'Mark new' : 'Mark read'}</button>}
                    {hasPermission('contact.delete') && <button className="admin-icon-btn danger" onClick={() => handleDelete(m)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="admin-card" style={{ marginTop: '20px' }}>
          <div className="admin-section-title">
            <span>Message from {selected.name} ({selected.email})</span>
            <button className="admin-icon-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
          <p style={{ margin: '0 0 8px', color: 'var(--admin-muted)' }}>
            {selected.phone && <>Phone: {selected.phone} · </>}Interest: {selected.interest || 'General'} · {new Date(selected.createdAt).toLocaleString()}
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{selected.message}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className="admin-btn success" onClick={() => handleResolve(selected)}>Mark Resolved</button>
            {hasPermission('contact.delete') && <button className="admin-btn danger" onClick={() => handleDelete(selected)}>Delete</button>}
          </div>
        </div>
      )}
    </PermissionGuard>
  );
}
