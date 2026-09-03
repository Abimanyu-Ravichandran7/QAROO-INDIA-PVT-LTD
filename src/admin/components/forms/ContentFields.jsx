import ImageInput from './ImageInput.jsx';

// ----- List of plain strings (skills, highlights, tools, etc.) -----
export function StringListEditor({ label, value = [], onChange, placeholder = 'Item', hint }) {
  const items = Array.isArray(value) ? value : [];
  const set = (list) => onChange(list);
  return (
    <div className="field">
      <label>{label}</label>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={it}
            placeholder={placeholder}
            onChange={(e) => { const n = [...items]; n[i] = e.target.value; set(n); }}
          />
          <button type="button" className="admin-icon-btn danger" onClick={() => set(items.filter((_, x) => x !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="admin-add-btn" onClick={() => set([...items, ''])}>+ Add {label}</button>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

// ----- Modules / process steps: array of { title, items[] } -----
export function ModuleListEditor({ label, value = [], onChange, itemPlaceholder = 'Item' }) {
  const list = Array.isArray(value) ? value : [];
  const set = (l) => onChange(l);
  return (
    <div className="field">
      <label>{label}</label>
      {list.map((mod, i) => (
        <div key={i} style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="text"
              value={mod.title || ''}
              placeholder="Module / Step title"
              style={{ flex: 1 }}
              onChange={(e) => { const n = [...list]; n[i] = { ...n[i], title: e.target.value }; set(n); }}
            />
            <button type="button" className="admin-icon-btn danger" onClick={() => set(list.filter((_, x) => x !== i))}>×</button>
          </div>
          {(mod.items || []).map((it, j) => (
            <div key={j} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <input
                type="text"
                value={it}
                placeholder={itemPlaceholder}
                onChange={(e) => { const n = [...list]; n[i].items = [...n[i].items]; n[i].items[j] = e.target.value; set(n); }}
              />
              <button type="button" className="admin-icon-btn danger" onClick={() => { const n = [...list]; n[i].items = n[i].items.filter((_, y) => y !== j); set(n); }}>×</button>
            </div>
          ))}
          <button type="button" className="admin-add-btn" onClick={() => { const n = [...list]; n[i] = { ...n[i], items: [...(n[i].items || []), ''] }; set(n); }} style={{ padding: '6px' }}>+ Add {itemPlaceholder}</button>
        </div>
      ))}
      <button type="button" className="admin-add-btn" onClick={() => set([...list, { title: '', items: [''] }])}>+ Add {label}</button>
    </div>
  );
}

// ----- FAQ: array of { q, a } -----
export function FaqListEditor({ label = 'FAQ', value = [], onChange }) {
  const list = Array.isArray(value) ? value : [];
  const set = (l) => onChange(l);
  return (
    <div className="field">
      <label>{label}</label>
      {list.map((f, i) => (
        <div key={i} style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={f.q || ''}
              placeholder="Question"
              style={{ flex: 1 }}
              onChange={(e) => { const n = [...list]; n[i] = { ...n[i], q: e.target.value }; set(n); }}
            />
            <button type="button" className="admin-icon-btn danger" onClick={() => set(list.filter((_, x) => x !== i))}>×</button>
          </div>
          <textarea
            rows={2}
            value={f.a || ''}
            placeholder="Answer"
            onChange={(e) => { const n = [...list]; n[i] = { ...n[i], a: e.target.value }; set(n); }}
          />
        </div>
      ))}
      <button type="button" className="admin-add-btn" onClick={() => set([...list, { q: '', a: '' }])}>+ Add FAQ</button>
    </div>
  );
}

// ----- SEO section -----
export function SeoFields({ get, set }) {
  const f = (k) => get(k);
  const s = (k) => (v) => set(k, v);
  return (
    <>
      <div className="form-grid">
        <div className="field">
          <label>SEO Title</label>
          <input type="text" value={f('seoTitle') || ''} onChange={(e) => s('seoTitle')(e.target.value)} placeholder="50–60 chars recommended" />
        </div>
        <div className="field">
          <label>SEO Description</label>
          <input type="text" value={f('seoDescription') || ''} onChange={(e) => s('seoDescription')(e.target.value)} placeholder="150–160 chars recommended" />
        </div>
      </div>
      <div className="field">
        <label>SEO Keywords</label>
        <input type="text" value={(f('seoKeywords') || []).join(', ')} onChange={(e) => s('seoKeywords')(e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} placeholder="Comma separated" />
      </div>
      <div className="form-grid">
        <div className="field">
          <label>OG Title</label>
          <input type="text" value={f('ogTitle') || ''} onChange={(e) => s('ogTitle')(e.target.value)} />
        </div>
        <div className="field">
          <label>OG Description</label>
          <input type="text" value={f('ogDescription') || ''} onChange={(e) => s('ogDescription')(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Canonical URL</label>
        <input type="text" value={f('canonicalUrl') || ''} onChange={(e) => s('canonicalUrl')(e.target.value)} placeholder="https://www.qarootech.in/learning-programs/slug" />
      </div>
      <div className="field">
        <label>OG / Share Image</label>
        <ImageInput value={f('ogImage') || ''} onChange={(v) => s('ogImage')(v)} />
      </div>
    </>
  );
}
