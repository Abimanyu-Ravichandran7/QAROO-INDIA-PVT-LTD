import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { COMPANY } from '../data/company.js';

const DEFAULT_FOOTER = {
  brandName: COMPANY.name,
  tagline: 'Business solutions and career-ready learning, from one team in Tamil Nadu.',
  email: COMPANY.email,
  phones: [...COMPANY.phones],
  businessLinks: [
    { label: 'CRM Solutions', path: '/business-solutions' },
    { label: 'Digital Marketing', path: '/business-solutions' },
    { label: 'Graphic Design', path: '/business-solutions' },
    { label: 'Web Development', path: '/business-solutions' },
    { label: 'Software Development', path: '/business-solutions' },
    { label: 'UI/UX & UX Research', path: '/business-solutions' },
    { label: 'Business Strategy', path: '/business-solutions' },
  ],
  learningLinks: [
    { label: 'Data Science & Analytics', path: '/learning-programs' },
    { label: 'Full Stack Development', path: '/learning-programs' },
    { label: 'UI/UX Design', path: '/learning-programs' },
    { label: 'Cyber Security', path: '/learning-programs' },
    { label: 'AI & Machine Learning', path: '/learning-programs' },
    { label: 'Graphic Design & Animation', path: '/learning-programs' },
    { label: 'Software Testing', path: '/learning-programs' },
  ],
  offices: COMPANY.offices.map((o) => ({ ...o })),
};

const officeLines = (office) =>
  Array.isArray(office.lines)
    ? office.lines
    : String(office.lines || '').split('\n').map((s) => s.trim()).filter(Boolean);

export default function Footer() {
  const cfg = DEFAULT_FOOTER;
  const brandName = DEFAULT_FOOTER.brandName;

  return (
    <footer style={{
      background: 'var(--eduact-black)',
      color: 'rgba(255,255,255,0.6)',
      padding: '64px 0 28px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <Container>
        <Row className="g-4" style={{ marginBottom: '48px' }}>
          <Col lg={4} md={6}>
            <Link to="/admin/login" aria-label="Admin login" style={{ display: 'inline-block', lineHeight: 0 }}>
              <span style={{ display: 'inline-block', background: '#fff', borderRadius: '10px', padding: '6px', marginBottom: '16px', lineHeight: 0 }}>
                <img
                  src="/logos/qaroo-logo.jpg"
                  alt={brandName}
                  style={{ height: '50px', width: '50px', objectFit: 'contain', display: 'block' }}
                />
              </span>
            </Link>
            <h5 style={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: '16px',
            }}>{cfg.brandName}</h5>
            <p style={{ fontSize: '13.5px', marginBottom: '10px' }}>
              {cfg.tagline}
            </p>
            <p style={{ fontSize: '13.5px', marginBottom: '10px' }}>
              <a href={`mailto:${cfg.email}`} style={{ color: 'var(--eduact-secondary)', fontWeight: 600, textDecoration: 'none' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                {cfg.email}
              </a>
            </p>
            {(cfg.phones || []).length > 0 && (
              <p style={{ fontSize: '13.5px', marginBottom: '10px', color: '#fff' }}>
                {cfg.phones.map((p, i) => (
                  <a key={p} href={`tel:${String(p).replace(/[^+\d]/g, '')}`} style={{
                    color: 'var(--eduact-secondary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginRight: i < cfg.phones.length - 1 ? '12px' : '0',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                    {p}
                  </a>
                ))}
              </p>
            )}
          </Col>

          <Col lg={2} md={6}>
            <h5 style={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: '16px',
            }}>Business Solutions</h5>
            {(cfg.businessLinks || []).map((item) => (
              <Link key={item.label} to={item.path} style={{
                display: 'block',
                fontSize: '13.5px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '10px',
                transition: 'color 0.15s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--eduact-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >{item.label}</Link>
            ))}
          </Col>

          <Col lg={2} md={6}>
            <h5 style={{
              fontFamily: 'var(--heading-font)',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#fff',
              marginBottom: '16px',
            }}>Learning</h5>
            {(cfg.learningLinks || []).map((item) => (
              <Link key={item.label} to={item.path} style={{
                display: 'block',
                fontSize: '13.5px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '10px',
                transition: 'color 0.15s',
              }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--eduact-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >{item.label}</Link>
            ))}
          </Col>

          {(cfg.offices || []).map((office, i) => (
            <Col lg={Math.max(2, Math.floor(4 / Math.max(1, (cfg.offices || []).length)))} md={6} key={office.title || i}>
              <h5 style={{
                fontFamily: 'var(--heading-font)',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fff',
                marginBottom: '16px',
              }}>{office.title}</h5>
              {officeLines(office).map((line) => (
                <p key={line} style={{ fontSize: '13.5px', marginBottom: '10px', color: 'rgba(255,255,255,0.75)' }}>
                  {line}
                </p>
              ))}
              {office.phone && (
                <p style={{ fontSize: '13.5px', marginBottom: '10px' }}>
                  <a href={`tel:${String(office.phone).replace(/[^+\d]/g, '')}`} style={{ color: 'var(--eduact-secondary)', fontWeight: 700, textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>{office.phone}</a>
                </p>
              )}
            </Col>
          ))}
        </Row>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12.5px',
          color: 'rgba(255,255,255,0.5)',
        }}>
          <span>© 2026 <span style={{ color: '#fff', fontWeight: 600 }}>{brandName}</span>. All rights reserved.</span>
          <span>
            <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none', marginRight: '10px' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none', marginRight: '10px' }}>Terms</Link>
            <Link to="/sitemap" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}