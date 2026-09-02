import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { mouApi } from '../../api/mouApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function MOUList() {
  const { hasPermission } = useAuth();
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchMous = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await mouApi.list({ search, status });
      setMous(res.data.mous || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchMous();
  }, [fetchMous]);

  const handleDelete = async (mou) => {
    if (!window.confirm(`Are you sure you want to delete this MOU?\n\n${mou.name}`)) return;
    try {
      await mouApi.remove(mou._id);
      toast.success(`Deleted "${mou.name}".`);
      fetchMous();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
      setError(err.message || 'Delete failed. Please try again.');
    }
  };

  const handlePublish = async (mou) => {
    try {
      await mouApi.togglePublish(mou._id);
      toast.success(mou.status === 'published' ? `Unpublished "${mou.name}".` : `Published "${mou.name}".`);
      fetchMous();
    } catch (err) {
      toast.error(err.message || 'Publish failed. Please try again.');
      setError(err.message || 'Publish failed. Please try again.');
    }
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <PermissionGuard permission="mou.read">
      <h1>MOU Directory</h1>
      <p className="page-sub">Manage memorandums of understanding shown on the public website.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search MOUs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '220px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {hasPermission('mou.create') && (
          <Link to="/admin/mous/create" className="admin-btn">+ Add MOU</Link>
        )}
      </div>

      {error && <div className="admin-alert error">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>MOU Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6"><LoadingState compact label="Loading MOUs..." /></td></tr>
            ) : error ? (
              <tr><td colSpan="6"><ErrorState compact title="Couldn't load MOUs" text={error} onRetry={fetchMous} /></td></tr>
            ) : mous.length === 0 ? (
              <tr><td colSpan="6"><EmptyState compact title="No MOUs found" text="Add your first MOU to start building the public directory." /></td></tr>
            ) : (
              mous.map((m) => (
                <tr key={m._id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.tag}</td>
                  <td>
                    <span className={`admin-badge ${m.status === 'published' ? 'green' : 'grey'}`}>{m.status}</span>
                  </td>
                  <td>{fmt(m.createdAt)}</td>
                  <td>{fmt(m.updatedAt)}</td>
                  <td>
                    <div className="actions">
                      {hasPermission('mou.update') && (
                        <>
                          <button className="admin-icon-btn act-publish" onClick={() => handlePublish(m)}>
                            {m.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link to={`/admin/mous/${m._id}/edit`} className="admin-icon-btn act-edit">Edit</Link>
                        </>
                      )}
                      {hasPermission('mou.delete') && (
                        <button className="admin-icon-btn danger" onClick={() => handleDelete(m)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PermissionGuard>
  );
}
