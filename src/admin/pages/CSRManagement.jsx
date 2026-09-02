import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { csrApi } from '../../api/csrApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function CSRManagement() {
  const { hasPermission } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const toast = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await csrApi.list({ search, year: year || undefined });
      setProjects(res.data.projects || []);
    } catch (err) {
      setError(err?.message || 'Could not load projects.');
    }
    finally { setLoading(false); }
  }, [search, year]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete project "${p.title}"?`)) return;
    try {
      await csrApi.remove(p._id);
      toast.success(`Deleted "${p.title}".`);
      fetchProjects();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
    }
  };
  const handlePublish = async (p) => {
    try {
      await csrApi.togglePublish(p._id);
      toast.success(p.status === 'published' ? `Unpublished "${p.title}".` : `Published "${p.title}".`);
      fetchProjects();
    } catch (err) {
      toast.error(err.message || 'Publish failed. Please try again.');
    }
  };

  return (
    <PermissionGuard permission="csr.read">
      <h1>CSR Projects</h1>
      <p className="page-sub">Manage corporate social responsibility projects.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }} />
        <select value={year} onChange={(e) => setYear(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
          <option value="">All years</option>
          <option value="24-25">24-25</option>
          <option value="25-26">25-26</option>
        </select>
        {hasPermission('csr.create') && <Link to="/admin/csr/create" className="admin-btn">+ Add Project</Link>}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Title</th><th>Year</th><th>Tag</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5"><LoadingState compact label="Loading projects..." /></td></tr>
            : error ? <tr><td colSpan="5"><ErrorState compact title="Couldn't load projects" text={error} onRetry={fetchProjects} /></td></tr>
            : projects.length === 0 ? <tr><td colSpan="5"><EmptyState compact title="No projects yet" text="Add your first CSR project to start building the public gallery." /></td></tr>
            : projects.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.title}</strong></td>
                <td>{p.year}</td>
                <td>{p.tag}</td>
                <td><span className={`admin-badge ${p.status === 'published' ? 'green' : 'grey'}`}>{p.status}</span></td>
                <td>
                  <div className="actions">
                    {hasPermission('csr.update') && (
                      <>
                        <button className="admin-icon-btn act-publish" onClick={() => handlePublish(p)}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                        <Link to={`/admin/csr/${p._id}/edit`} className="admin-icon-btn act-edit">Edit</Link>
                      </>
                    )}
                    {hasPermission('csr.delete') && <button className="admin-icon-btn danger" onClick={() => handleDelete(p)}>Delete</button>}
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
