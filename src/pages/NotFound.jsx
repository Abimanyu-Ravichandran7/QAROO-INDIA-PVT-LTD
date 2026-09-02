import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found — Qaroo India Private Limited"
        description="The page you are looking for could not be found. Explore business solutions, learning programs, CSR projects and more at Qaroo India."
        path="/404"
      />
      <div
        style={{
          background: 'var(--eduact-base)',
          padding: '90px 0 110px',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(228,204,46,0.4), transparent 70%)',
          }}
        />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <span
            style={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 800,
              fontSize: 'clamp(6rem, 16vw, 11rem)',
              lineHeight: 1,
              color: 'rgba(255,255,255,0.16)',
              display: 'block',
              letterSpacing: '-0.03em',
            }}
          >
            404
          </span>
          <h1
            style={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 800,
              color: '#fff',
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              marginTop: '-0.4em',
            }}
          >
            Page not found
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '520px', margin: '16px auto 0', fontSize: '15px' }}>
            The page you were looking for doesn't exist or has been moved. Head back to the homepage to keep exploring
            business solutions, learning programs and CSR projects.
          </p>
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-eduact">Back to Home</Link>
            <Link to="/contact" className="btn-eduact-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Contact Us
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}
