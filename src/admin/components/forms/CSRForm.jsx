import { useState } from 'react';
import ImageInput from './ImageInput.jsx';

const defaults = { year: '24-25', tag: '', title: '', desc: '', partner: '', location: '', beneficiaries: '', image: '', status: 'published' };

export default function CSRForm({ initial, onSubmit, submitting }) {
  const [form, setForm] = useState(() => (initial ? { ...defaults, ...initial } : { ...defaults }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {submitting && <div className="admin-alert info">Saving...</div>}

      <div className="admin-card">
        <h2>Project Details</h2>
        <div className="form-grid">
          <div className="field">
            <label>Year *</label>
            <input type="text" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="24-25" required />
          </div>
          <div className="field">
            <label>Tag</label>
            <input type="text" value={form.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Skill Development" />
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="field">
            <label>Image</label>
            <ImageInput value={form.image} onChange={(v) => set('image', v)} />
          </div>
        </div>
        <div className="field">
          <label>Project Title *</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={3} value={form.desc} onChange={(e) => set('desc', e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Partner</label>
            <input type="text" value={form.partner} onChange={(e) => set('partner', e.target.value)} />
          </div>
          <div className="field">
            <label>Location</label>
            <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Beneficiaries</label>
          <input type="text" value={form.beneficiaries} onChange={(e) => set('beneficiaries', e.target.value)} placeholder="500+ students" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" className="admin-btn outline" onClick={() => onSubmit({ ...form, status: 'draft' })} disabled={submitting}>Save Draft</button>
        <button type="submit" className="admin-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Publish'}</button>
      </div>
    </form>
  );
}
