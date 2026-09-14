import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { COMPANY } from '../data/company.js';
import { learningApi } from '../api/learningApi.js';
import { businessSolutionApi } from '../api/businessSolutionApi.js';

const DEFAULT_NAVBAR = {
  businessTitle: 'Business Solutions',
  businessLinks: [
    { label: 'CRM Solutions', path: '/business-solutions/crm-solutions' },
    { label: 'Digital Marketing', path: '/business-solutions/digital-marketing' },
    { label: 'Graphic Design & Branding', path: '/business-solutions/graphic-design-branding' },
    { label: 'Web Development', path: '/business-solutions/web-development' },
    { label: 'Software Development', path: '/business-solutions/software-development' },
    { label: 'UI/UX Design', path: '/business-solutions/ui-ux-design' },
    { label: 'UX Research', path: '/business-solutions/ux-research' },
    { label: 'Business Strategy', path: '/business-solutions/business-strategy' },
  ],
  learningTitle: 'Learning',
  learningLinks: [
    { label: 'Data Science & Business Analytics', path: '/learning-programs/data-science-business-analytics' },
    { label: 'Full Stack Development', path: '/learning-programs/full-stack-development' },
    { label: 'UI/UX Design', path: '/learning-programs/ui-ux-design' },
    { label: 'Cyber Security & Ethical Hacking', path: '/learning-programs/cyber-security-ethical-hacking' },
    { label: 'AI & Machine Learning', path: '/learning-programs/ai-machine-learning' },
    { label: 'Graphic Design & Animation', path: '/learning-programs/graphic-design-animation' },
    { label: 'Software Testing', path: '/learning-programs/software-testing' },
  ],
  csrTitle: 'CSR Projects',
  csrLinks: [
    { label: 'CSR Projects Overview', path: '/csr-projects' },
    { label: '📋 MOU Directory', path: '/mou-directory' },
  ],
  navLinks: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ],
  phone: COMPANY.primaryPhone,
  ctaText: 'Talk to an Expert',
  ctaPath: '/contact',
};

const splitHalf = (arr = []) => {
  const mid = Math.ceil(arr.length / 2);
  return [arr.slice(0, mid), arr.slice(mid)];
};

export default function NavigationBar() {
  const [navLinks, setNavLinks] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const cfg = navLinks || DEFAULT_NAVBAR;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load dynamic learning programs + business solutions for the dropdowns.
  useEffect(() => {
    let active = true;
    Promise.all([
      learningApi.list({}, { credentials: 'omit' }).catch(() => null),
      businessSolutionApi.list({}, { credentials: 'omit' }).catch(() => null),
    ]).then(([lres, bres]) => {
      if (!active) return;
      const programs = (lres?.data?.programs || [])
        .filter((p) => p.status === 'published')
        .map((p) => ({ label: p.title || p.pageName, path: `/learning-programs/${p.slug}` }));
      const solutions = (bres?.data?.solutions || [])
        .filter((s) => s.status === 'published')
        .map((s) => ({ label: s.pageName || s.title, path: `/business-solutions/${s.slug}` }));
      // Only override when we have real data; otherwise keep defaults.
      if (programs.length === 0 && solutions.length === 0) return;
      setNavLinks({
        ...DEFAULT_NAVBAR,
        learningLinks: programs.length ? programs : DEFAULT_NAVBAR.learningLinks,
        businessLinks: solutions.length ? solutions : DEFAULT_NAVBAR.businessLinks,
      });
    });
    return () => { active = false; };
  }, []);


  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const [bizCol1, bizCol2] = splitHalf(cfg.businessLinks);
  const [learnCol1, learnCol2] = splitHalf(cfg.learningLinks);

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--eduact-black)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(228,204,46,0.2)',
        padding: scrolled ? '8px 0' : '14px 0',
        transition: 'padding 0.25s ease, box-shadow 0.25s ease',
        boxShadow: scrolled ? '0 8px 24px rgba(42,37,77,0.35)' : 'none',
      }}
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <img
            src="/logos/qaroo-logo.jpg"
            alt="Qaroo India"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.6)',
              padding: '6px 8px',
            }}
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />

        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto" style={{ gap: '4px' }}>
            {/* Business Solutions Mega Dropdown */}
            <NavDropdown
              title={<span style={{ fontWeight: 600, fontSize: '14.5px', color: '#fff' }}>{cfg.businessTitle}</span>}
              id="business-dropdown"
              className={location.pathname.startsWith('/business-solutions') ? 'active' : ''}
            >
              <div className="mega-grid">
                <div>
                  <Link
                    to="/business-solutions"
                    className="services-link"
                    style={{
                      fontFamily: 'var(--heading-font)',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--eduact-base)',
                      display: 'block',
                      marginBottom: '10px',
                      paddingLeft: '12px',
                      textDecoration: 'none',
                    }}
                  >
                    Services
                  </Link>
                  {bizCol1.map((link) => (
                    <NavDropdown.Item
                      key={link.label}
                      as={Link}
                      to={link.path}
                      style={{
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        color: 'var(--eduact-black)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(147,25,19,0.08)';
                        e.currentTarget.style.paddingLeft = '16px';
                        e.currentTarget.style.color = 'var(--eduact-base)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '12px';
                        e.currentTarget.style.color = 'var(--eduact-black)';
                      }}
                    >
                      {link.label}
                    </NavDropdown.Item>
                  ))}
                </div>
                <div>
                  <span style={{
                    fontFamily: 'var(--heading-font)',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--eduact-base)',
                    display: 'block',
                    marginBottom: '10px',
                    paddingLeft: '12px',
                  }}>&nbsp;</span>
                  {bizCol2.map((link) => (
                    <NavDropdown.Item
                      key={link.label}
                      as={Link}
                      to={link.path}
                      style={{
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        color: 'var(--eduact-black)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(147,25,19,0.08)';
                        e.currentTarget.style.paddingLeft = '16px';
                        e.currentTarget.style.color = 'var(--eduact-base)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '12px';
                        e.currentTarget.style.color = 'var(--eduact-black)';
                      }}
                    >
                      {link.label}
                    </NavDropdown.Item>
                  ))}
                </div>
              </div>
            </NavDropdown>

            {/* Learning Mega Dropdown */}
            <NavDropdown
              title={<span style={{ fontWeight: 600, fontSize: '14.5px', color: '#fff' }}>{cfg.learningTitle}</span>}
              id="learning-dropdown"
              className={location.pathname.startsWith('/learning-programs') ? 'active' : ''}
            >
              <div className="mega-grid">
                <div>
                  <Link
                    to="/learning-programs"
                    className="services-link"
                    style={{
                      fontFamily: 'var(--heading-font)',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--eduact-base)',
                      display: 'block',
                      marginBottom: '10px',
                      paddingLeft: '12px',
                      textDecoration: 'none',
                    }}
                  >
                    Career Tracks
                  </Link>
                  {learnCol1.map((link) => (
                    <NavDropdown.Item
                      key={link.label}
                      as={Link}
                      to={link.path}
                      style={{
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        color: 'var(--eduact-black)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(147,25,19,0.08)';
                        e.currentTarget.style.paddingLeft = '16px';
                        e.currentTarget.style.color = 'var(--eduact-base)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '12px';
                        e.currentTarget.style.color = 'var(--eduact-black)';
                      }}
                    >
                      {link.label}
                    </NavDropdown.Item>
                  ))}
                </div>
                <div>
                  <span style={{
                    fontFamily: 'var(--heading-font)',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--eduact-base)',
                    display: 'block',
                    marginBottom: '10px',
                    paddingLeft: '12px',
                  }}>&nbsp;</span>
                  {learnCol2.map((link) => (
                    <NavDropdown.Item
                      key={link.label}
                      as={Link}
                      to={link.path}
                      style={{
                        fontSize: '14px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        color: 'var(--eduact-black)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(147,25,19,0.08)';
                        e.currentTarget.style.paddingLeft = '16px';
                        e.currentTarget.style.color = 'var(--eduact-base)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.paddingLeft = '12px';
                        e.currentTarget.style.color = 'var(--eduact-black)';
                      }}
                    >
                      {link.label}
                    </NavDropdown.Item>
                  ))}
                </div>
              </div>
            </NavDropdown>

            {/* CSR Projects Dropdown */}
            <NavDropdown
              title={<span style={{ fontWeight: 600, fontSize: '14.5px', color: '#fff' }}>{cfg.csrTitle}</span>}
              id="csr-dropdown"
              className={isActive('/csr-projects') || isActive('/mou-directory') ? 'active' : ''}
            >
              {cfg.csrLinks.map((link, i) => (
                <div key={link.label + i}>
                  {i > 0 && <NavDropdown.Divider style={{ borderColor: 'rgba(147,25,19,0.15)' }} />}
                  <NavDropdown.Item as={Link} to={link.path} style={{
                    fontSize: '14px',
                    padding: '10px 16px',
                    fontWeight: i === 0 ? 400 : 700,
                    color: i === 0 ? 'var(--eduact-black)' : 'var(--eduact-base)',
                  }}>
                    {link.label}
                  </NavDropdown.Item>
                </div>
              ))}
            </NavDropdown>

            {cfg.navLinks.map((link) => (
              <Nav.Link
                key={link.path}
                as={Link}
                to={link.path}
                style={{
                  fontWeight: 600,
                  fontSize: '14.5px',
                  color: isActive(link.path) ? '#fff' : 'rgba(255,255,255,0.85)',
                  borderBottom: isActive(link.path) ? '2px solid var(--eduact-secondary)' : '2px solid transparent',
                  margin: '0 4px',
                  paddingBottom: '6px',
                }}
              >
                {link.label}
              </Nav.Link>
            ))}
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }} className="d-none d-lg-inline">
              {cfg.phone}
            </span>
            <Link to={cfg.ctaPath} className="btn-eduact" style={{
              fontSize: '13px',
              padding: '10px 20px',
              background: 'var(--eduact-secondary)',
              color: 'var(--eduact-black)',
            }}>
              {cfg.ctaText}
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>

      <style>{`
        .navbar-dark .navbar-nav .nav-link {
          position: relative;
          border-radius: 8px;
          transition: background 0.22s ease, color 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
        }
        .navbar-dark .navbar-nav .nav-link:hover,
        .navbar-dark .navbar-nav .nav-link:focus {
          color: #fff !important;
          background: rgba(255,255,255,0.13);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }
        .dropdown-menu {
          background: #fff;
          border: 1px solid var(--eduact-soft4);
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(42,37,77,0.15);
          padding: 12px;
          margin-top: 8px !important;
        }
        .dropdown-item {
          color: var(--eduact-black);
          border-radius: 8px;
        }
        .dropdown-item:hover, .dropdown-item:focus {
          background: rgba(147,25,19,0.08);
          color: var(--eduact-base);
        }
        .dropdown-toggle::after {
          vertical-align: middle;
          margin-left: 6px;
          border-top-color: rgba(255,255,255,0.7);
        }
        .services-link:hover {
          color: var(--eduact-dark, #7a120e) !important;
          text-decoration: underline !important;
        }
        .mega-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          min-width: min(440px, 92vw);
          padding: 8px;
        }
        @media (min-width: 576px) and (max-width: 991px) {
          .mega-grid {
            min-width: 0;
          }
        }
        @media (max-width: 575px) {
          .mega-grid {
            min-width: 0;
            grid-template-columns: 1fr;
            gap: 2px;
            padding: 2px;
          }
        }
        @media (max-width: 991px) {
          .dropdown-menu {
            min-width: 100% !important;
            box-shadow: none;
            border: none;
            background: rgba(0,0,0,0.15);
          }
          .dropdown-item {
            color: rgba(255,255,255,0.9);
          }
          .dropdown-item:hover {
            background: rgba(255,255,255,0.08);
            color: #fff;
          }
        }
      `}</style>
    </Navbar>
  );
}
