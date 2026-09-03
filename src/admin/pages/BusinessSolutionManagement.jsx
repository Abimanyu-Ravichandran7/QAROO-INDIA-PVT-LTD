import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { businessSolutionApi } from '../../api/businessSolutionApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { ShimmerPanel, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function BusinessSolutionManagement() {
  const { hasPermission } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const res = await businessSolutionApi.list({ search }); setSolutions(res.data.solutions || []); }
    catch (err) { setError(err?.message || 'Could not load business solutions.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchSolutions(); }, [fetchSolutions]);

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete business solution "${s.title}"?`)) return;
    try {
      await businessSolutionApi.remove(s._id);
      toast.success(`Deleted "${s.title}".`);
      fetchSolutions();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
    }
  };
  const handlePublish = async (s) => {
    try {
      await businessSolutionApi.togglePublish(s._id);
      toast.success(s.status === 'published' ? `Unpublished "${s.title}".` : `Published "${s.title}".`);
      fetchSolutions();
    } catch (err) {
      toast.error(err.message || 'Publish failed. Please try again.');
    }
  };

  return (
    <PermissionGuard permission="business.read">
      <h1>Business Solutions</h1>
      <p className="page-sub">Manage business solutions / services.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }} />
        {hasPermission('business.create') && <Link to="/admin/business-solutions/create" className="admin-btn">+ Add Solution</Link>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Slug</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4"><ShimmerPanel variant="table" header={false} /></td></tr>
            : error ? <tr><td colSpan="4"><ErrorState compact title="Couldn't load solutions" text={error} onRetry={fetchSolutions} /></td></tr>
            : solutions.length === 0 ? <tr><td colSpan="4"><EmptyState compact title="No solutions yet" text="Add your first business solution to start building the public services page." /></td></tr>
            : solutions.map((s) => (
              <tr key={s._id}>
                <td><strong>{s.pageName || s.title}</strong></td>
                <td><code style={{ fontSize: '12px' }}>{s.slug || '—'}</code></td>
                <td><span className={`admin-badge ${s.status === 'published' ? 'green' : 'grey'}`}>{s.status}</span></td>
                <td>
                  <div className="actions">
                    {hasPermission('business.update') && (
                      <>
                        <button className="admin-icon-btn act-publish" onClick={() => handlePublish(s)}>{s.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                        <Link to={`/admin/business-solutions/${s._id}/edit`} className="admin-icon-btn act-edit">Edit</Link>
                      </>
                    )}
                    {hasPermission('business.delete') && <button className="admin-icon-btn danger" onClick={() => handleDelete(s)}>Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PermissionGuard>
  );
}
