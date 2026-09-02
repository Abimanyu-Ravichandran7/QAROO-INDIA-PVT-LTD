import { Container } from 'react-bootstrap';

export default function LegalLayout({ title, eyebrow, updated, children }) {
  return (
    <>
      <div style={{
        background: 'var(--eduact-base)',
        padding: '60px 0 70px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228,204,46,0.35), transparent 70%)',
        }} />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 style={{
            fontFamily: 'var(--heading-font)',
            fontWeight: 800,
            color: '#fff',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginTop: '10px',
          }}>{title}</h1>
          {updated && <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px', fontSize: '13px' }}>Last updated: {updated}</p>}
        </Container>
      </div>
      <Container className="page-section">
        <div className="eduact-card" style={{ padding: '36px', maxWidth: '820px' }}>
          {children}
        </div>
      </Container>
    </>
  );
}
