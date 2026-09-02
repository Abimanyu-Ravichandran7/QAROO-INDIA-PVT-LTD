import { useRef, useState } from 'react';

export default function ImageInput({ value = '', onChange, allowUrl = true, accept = 'image/*' }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };

  const isFile = typeof value === 'string' && value.startsWith('data:');

  return (
    <div className="image-input">
      <div
        className={`image-input__drop${drag ? ' is-dragging' : ''}`}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); readFile(e.dataTransfer.files && e.dataTransfer.files[0]); }}
        role="button"
        tabIndex={0}
      >
        {value ? (
          <img src={value} alt="preview" className="image-input__preview" />
        ) : (
          <div className="image-input__placeholder">
            <span className="image-input__icon">🖼</span>
            <span>Click to choose a file or drag & drop here</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => readFile(e.target.files && e.target.files[0])}
      />

      <div className="image-input__controls">
        <button type="button" className="admin-outline-btn" onClick={() => inputRef.current && inputRef.current.click()}>
          Choose File
        </button>
        {value ? (
          <button type="button" className="admin-icon-btn danger" onClick={() => onChange('')}>Remove</button>
        ) : null}
      </div>

      {isFile ? (
        <div className="admin-alert info image-input__note">
          Selected from device{allowUrl ? ' — or paste a URL below to use an external image instead.' : ''}
        </div>
      ) : null}

      {allowUrl ? (
        <div className="admin-form" style={{ marginTop: '8px' }}>
          <div className="field">
            <label>...or paste an image URL</label>
            <input
              type="text"
              value={isFile ? '' : value}
              placeholder="https://..."
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
