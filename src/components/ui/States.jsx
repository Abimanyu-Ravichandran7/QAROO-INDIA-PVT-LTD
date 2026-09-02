import React from 'react';

export function LoadingState({ label = 'Loading...', compact }) {
  return (
    <div className={`state-wrap${compact ? ' compact' : ''}`} role="status" aria-live="polite">
      <span className="state-spinner" aria-hidden="true" />
      <p className="state-text">{label}</p>
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', text, action, compact }) {
  return (
    <div className={`state-wrap${compact ? ' compact' : ''}`}>
      <span className="state-icon" aria-hidden="true">◎</span>
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', text, onRetry, compact }) {
  return (
    <div className={`state-wrap${compact ? ' compact' : ''}`} role="alert">
      <span className="state-icon error" aria-hidden="true">!</span>
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {onRetry && (
        <button type="button" className="state-btn" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}