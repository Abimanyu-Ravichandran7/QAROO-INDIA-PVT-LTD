import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { learningApi } from '../../api/learningApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { ShimmerPanel, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function LearningManagement() {
  const { hasPermission } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const res = await learningApi.list({ search }); setPrograms(res.data.programs || []); }
    catch (err) { setError(err?.message || 'Could not load programs.'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete program "${p.title}"?`)) return;
    try {
      await learningApi.remove(p._id);
      toast.success(`Deleted "${p.title}".`);
      fetchPrograms();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
    }
  };
  const handlePublish = async (p) => {
    try {
      await learningApi.togglePublish(p._id);
      toast.success(p.status === 'published' ? `Unpublished "${p.title}".` : `Published "${p.title}".`);
      fetchPrograms();
    } catch (err) {
      toast.error(err.message || 'Publish failed. Please try again.');
    }
  };

  return (
    <PermissionGuard permission="learning.read">
      <h1>Learning Programs</h1>
      <p className="page-sub">Manage learning programs / career tracks.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }} />
        {hasPermission('learning.create') && <Link to="/admin/learning/create" className="admin-btn">+ Add Program</Link>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Category</th><th>Skills</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5"><ShimmerPanel variant="table" header={false} /></td></tr>
            : error ? <tr><td colSpan="5"><ErrorState compact title="Couldn't load programs" text={error} onRetry={fetchPrograms} /></td></tr>
            : programs.length === 0 ? <tr><td colSpan="5"><EmptyState compact title="No programs yet" text="Add your first learning program to start building the public career tracks." /></td></tr>
            : programs.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.title}</strong></td>
                <td>{p.category || '—'}</td>
                <td><span style={{ fontSize: '12px' }}>{(p.skills || []).join(', ') || '—'}</span></td>
                <td><span className={`admin-badge ${p.status === 'published' ? 'green' : 'grey'}`}>{p.status}</span></td>
                <td>
                  <div className="actions">
                    {hasPermission('learning.update') && (
                      <>
                        <button className="admin-icon-btn act-publish" onClick={() => handlePublish(p)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                        <Link to={`/admin/learning/${p._id}/edit`} className="admin-icon-btn act-edit">Edit</Link>
                      </>
                    )}
                    {hasPermission('learning.delete') && <button className="admin-icon-btn danger" onClick={() => handleDelete(p)}>Delete</button>}
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
