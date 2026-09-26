import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { careerApi } from '../../api/careerApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PermissionGuard from '../components/PermissionGuard.jsx';
import { ShimmerPanel, EmptyState, ErrorState } from '../../components/ui/States';
import { useToast } from '../../context/ToastContext';

export default function CareerManagement() {
  const { hasPermission } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // status:'all' so drafts are listed here, unlike the public page.
      const res = await careerApi.list({ search, status: 'all' });
      setJobs(res.data.jobs || []);
    } catch (err) {
      setError(err?.message || 'Could not load job postings.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleDelete = async (j) => {
    if (!window.confirm(`Delete job posting "${j.title}"?\n\nApplications already received for this role are kept.`)) return;
    try {
      const res = await careerApi.remove(j._id);
      toast.success(res?.message || `Deleted "${j.title}".`);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Delete failed. Please try again.');
    }
  };

  const handlePublish = async (j) => {
    try {
      await careerApi.togglePublish(j._id);
      toast.success(j.status === 'published' ? `Unpublished "${j.title}".` : `Published "${j.title}".`);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Publish failed. Please try again.');
    }
  };

  return (
    <PermissionGuard permission="careers.read">
      <h1>Careers</h1>
      <p className="page-sub">Manage job postings. Only published roles appear on the website.</p>

      <div className="admin-card" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}
        />
        {hasPermission('careers.create') && (
          <Link to="/admin/careers/create" className="admin-btn">+ Add Job Posting</Link>
        )}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Role</th><th>Department</th><th>Slug</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5"><ShimmerPanel variant="table" header={false} /></td></tr>
            ) : error ? (
              <tr><td colSpan="5"><ErrorState compact title="Couldn't load job postings" text={error} onRetry={fetchJobs} /></td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan="5"><EmptyState compact title="No job postings yet" text="Add your first role to start the public careers page." /></td></tr>
            ) : (
              jobs.map((j) => (
                <tr key={j._id}>
                  <td><strong>{j.pageName || j.title}</strong></td>
                  <td>{j.department || '-'}</td>
                  <td><code style={{ fontSize: '12px' }}>{j.slug || '-'}</code></td>
                  <td><span className={`admin-badge ${j.status === 'published' ? 'green' : 'grey'}`}>{j.status}</span></td>
                  <td>
                    <div className="actions">
                      {hasPermission('careers.update') && (
                        <>
                          <button className="admin-icon-btn act-publish" onClick={() => handlePublish(j)}>
                            {j.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link to={`/admin/careers/${j._id}/edit`} className="admin-icon-btn act-edit">Edit</Link>
                        </>
                      )}
                      {hasPermission('careers.delete') && (
                        <button className="admin-icon-btn danger" onClick={() => handleDelete(j)}>Delete</button>
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
