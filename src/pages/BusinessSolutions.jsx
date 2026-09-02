import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ScrollExpand from '../components/ScrollExpand';
import Seo from '../components/Seo.jsx';
import { contentApi } from '../api/contentApi.js';

const DEFAULT_SERVICES = [
  { idx: '01', title: 'CRM Solutions', desc: 'Strategy, implementation, customization and pipeline reporting built around how your sales team actually sells. We help you choose, configure, and adopt the right CRM for your workflow.' },
  { idx: '02', title: 'Digital Marketing', desc: 'SEO, content and performance marketing built around measurable business growth, not vanity metrics. From keyword strategy to conversion optimization.' },
  { idx: '03', title: 'Graphic Design & Branding', desc: 'Brand identity, collateral and creative systems that hold up across every channel you use. Logos, brand guidelines, social assets, and print-ready designs.' },
  { idx: '04', title: 'Web Development', desc: 'Fast, SEO-friendly business websites — from landing pages to full e-commerce builds. React, WordPress, or custom stacks based on your needs.' },
  { idx: '05', title: 'Software Development', desc: 'Custom software, internal tools and SaaS products built to solve one specific business problem well. End-to-end development with ongoing support.' },
  { idx: '06', title: 'UI/UX Design', desc: 'Wireframes to design systems — usability and conversion, not just visual polish. We design experiences that users actually enjoy.' },
  { idx: '07', title: 'UX Research', desc: 'User interviews, usability testing and journey mapping that inform product decisions before you build. Data-driven design thinking.' },
  { idx: '08', title: 'Business Strategy', desc: 'Growth, go-to-market and digital transformation strategy with a clear discover-to-measure methodology. Roadmaps that actually get executed.' },
];

export default function BusinessSolutions() {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [links, setLinks] = useState([]);
  const [ctaTitle, setCtaTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    contentApi
      .get('business', { credentials: 'omit' })
      .then((res) => {
        if (!active) return;
        const data = res?.data?.content?.data;
        if (data?.services?.length) setServices(data.services);
        if (Array.isArray(data?.links) && data.links.length) setLinks(data.links.filter(Boolean));
        if (data?.ctaTitle) setCtaTitle(data.ctaTitle);
      })
      .catch(() => { if (active) setError('Some content could not be loaded and may be out of date.'); });
    return () => { active = false; };
  }, []);

  return (
    <>
      <Seo
        title="Business Solutions — Qaroo India Private Limited | CRM, Marketing, Design, Software, Strategy"
        description="Business solutions from Qaroo India Private Limited: CRM solutions, digital marketing & SEO, graphic design & branding, web & software development, UI/UX design, UX research and business strategy."
        path="/business-solutions"
      />
      {/* ScrollExpand Hero */}
      <ScrollExpand
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
        alt="Modern office workspace"
        title="Work that moves a real metric."
        scrollHint="Scroll to expand"
        useWindowScroll
        startWidth={42}
        startHeight={58}
        startRadius={24}
        endRadius={0}
          mediaZoom={1.35}
          scrollDistance={1.2}
          holdDistance={0.35}
          smoothing={0.05}
          overlayScrim={0.45}
      >
        <h2 style={{ color: '#fff', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, maxWidth: '600px', textShadow: '0 2px 24px rgba(0,0,0,0.45)' }}>
          Every engagement is scoped around a business outcome — not a generic service list.
        </h2>
      </ScrollExpand>

      <Container className="page-section">
        {error && (
          <div style={{
            background: 'rgba(228,204,46,0.12)',
            border: '1px solid var(--eduact-secondary)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--eduact-black)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        {/* Services navigation */}
        <nav aria-label="Services navigation" style={{ marginBottom: '36px' }}>
          <style>{`
            .services-nav {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              align-items: center;
              justify-content: center;
            }
            .services-nav-link {
              display: inline-flex;
              alignItems: center;
              gap: 6px;
              font-size: 14px;
              font-weight: 600;
              color: var(--eduact-black);
              background: #fff;
              border: 1px solid var(--eduact-soft4);
              border-radius: 999px;
              padding: 9px 16px;
              box-shadow: 0 4px 12px rgba(42,37,77,0.05);
              transition: all 0.18s ease;
              text-decoration: none;
            }
            .services-nav-link:hover {
              color: #fff;
              background: var(--eduact-base);
              border-color: var(--eduact-base);
              transform: translateY(-2px);
              box-shadow: 0 8px 18px rgba(147,25,19,0.25);
            }
            .services-nav-link.is-home {
              color: #fff;
              background: var(--eduact-base);
              border-color: var(--eduact-base);
            }
            .services-nav-link.is-home:hover {
              background: var(--eduact-dark, #7a120e);
              border-color: var(--eduact-dark, #7a120e);
            }
          `}</style>
          <div className="services-nav">
            <a href="/business-solutions" className="services-nav-link is-home">
              Business Solutions
            </a>
            {services.map((s) => (
              <a
                key={s.idx || s.title}
                href={`#service-${s.idx || s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="services-nav-link"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <Row className="g-4 reveal-stagger">
          {services.map((s) => (
            <Col key={s.idx || s.title} id={`service-${s.idx || s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} md={6} lg={4} style={{ scrollMarginTop: '120px' }}>
              <div className="eduact-card" style={{ height: '100%', borderTop: '3px solid var(--eduact-base)' }}>
                <span className="idx">{s.idx} / {s.title.split(' ')[0]}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </Col>
          ))}
        </Row>

        <div className="mt-5 pt-4 reveal text-center">
          <p className="eyebrow">Ready to start?</p>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>{ctaTitle || "Let's discuss your business challenge."}</h2>
          <Link to="/contact" className="btn-eduact">Get in Touch</Link>
        </div>

        {links.length > 0 && (
          <div className="mt-5 pt-4 reveal">
            <p className="eyebrow" style={{ textAlign: 'center' }}>Useful Links</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
              {links.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                   className="btn-eduact" style={{ fontSize: '14px', padding: '10px 18px' }}>
                  {url.replace(/^https?:\/\//, '').replace(/\/$/, '') || url}
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
