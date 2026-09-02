import { useState } from 'react';
import ImageInput from './ImageInput.jsx';

const defaults = { title: '', desc: '', skills: [''], category: '', image: '', status: 'published' };

export default function LearningForm({ initial, onSubmit, submitting }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { ...defaults };
    return {
      ...defaults,
      ...initial,
      skills: initial.skills?.length ? initial.skills : [''],
    };
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSkill = (i, v) => { const s = [...form.skills]; s[i] = v; set('skills', s); };
  const addSkill = () => set('skills', [...form.skills, '']);
  const removeSkill = (i) => set('skills', form.skills.filter((_, x) => x !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, skills: form.skills.filter((s) => s.trim() !== '') });
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {submitting && <div className="admin-alert info">Saving...</div>}

      <div className="admin-card">
        <h2>Program Details</h2>
        <div className="form-grid">
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="field">
            <label>Category</label>
            <input type="text" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="Career Track" />
          </div>
        </div>
        <div className="field">
          <label>Program Title *</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea rows={3} value={form.desc} onChange={(e) => set('desc', e.target.value)} />
        </div>
        <div className="field">
          <label>Image</label>
          <ImageInput value={form.image} onChange={(v) => set('image', v)} />
        </div>
      </div>

      <div className="admin-card">
        <h2>Skills</h2>
        {form.skills.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input type="text" value={s} onChange={(e) => setSkill(i, e.target.value)} placeholder="Skill" />
            <button type="button" className="admin-icon-btn danger" onClick={() => removeSkill(i)}>×</button>
          </div>
        ))}
        <button type="button" className="admin-add-btn" onClick={addSkill}>+ Add Skill</button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="button" className="admin-btn outline" onClick={() => onSubmit({ ...form, status: 'draft', skills: form.skills.filter((s) => s.trim() !== '') })} disabled={submitting}>Save Draft</button>
        <button type="submit" className="admin-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Publish'}</button>
      </div>
    </form>
  );
}
