import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import WebThreads from '../components/WebThreads';
import StrokeText from '../components/StrokeText';
import StarBorder from '../components/StarBorder';
import MagicBento from '../components/MagicBento';
import CountUp from '../components/CountUp';
import GlareHover from '../components/GlareHover';
import Seo from '../components/Seo.jsx';
import { contentApi } from '../api/contentApi.js';
import { statsApi } from '../api/statsApi.js';

const DEFAULT_HOME = {
  heroEyebrow: 'Coimbatore · Chennai',
  heroTitle: 'Business solutions and career-ready skills, from one team.',
  heroDescription:
    'Qaroo India Private Limited builds digital solutions for businesses — CRM, marketing, design, software, strategy — and builds careers for people through practical, industry-linked training.',
  buttons: [
    { text: 'Explore Business Solutions', link: '/business-solutions', style: 'yellow' },
    { text: 'Explore Learning Programs', link: '/learning-programs', style: 'white' },
  ],
  statistics: [
    { num: 20, label: 'Memorandums of Understanding (MoUs) signed' },
    { num: 12, label: 'CSR projects delivered' },
    { num: 2, label: 'Office locations — Coimbatore & Chennai' },
  ],
  partners: ['Infosys Foundation', 'EduBridge', 'Atos Prayas Foundation', 'Canara Bank', 'AISECT', 'SNS College of Engineering', 'Dr. SNS Rajalakshmi College', 'Narayana Engineering College Nellore', 'Nayago Educational Trust'],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you work with businesses and train individuals at the same time?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — Business Solutions and Learning are two divisions of the same organization, run to the same standard.' },
    },
    {
      '@type': 'Question',
      name: 'Where are you based?',
      acceptedAnswer: { '@type': 'Answer', text: 'Head office in Coimbatore, branch office in Chennai (Pallavaram). Both business and learning inquiries can reach either office.' },
    },
    {
      '@type': 'Question',
      name: 'How do I see your CSR project history?',
      acceptedAnswer: { '@type': 'Answer', text: 'The CSR Projects section on our website lists our programs by year — 2024–25 and 2025–26 — with full details added as each project is confirmed.' },
    },
    {
      '@type': 'Question',
      name: 'What is the MOU Directory?',
      acceptedAnswer: { '@type': 'Answer', text: 'Our MOU Directory documents every memorandum of understanding on record — who the partner is, what it can offer students, and our assessment of how strong the collaboration actually is.' },
    },
  ],
};

export default function Home() {
  const [csrTab, setCsrTab] = useState('24-25');
  const [hoverBtn, setHoverBtn] = useState(null);
  const [home, setHome] = useState(DEFAULT_HOME);

  useEffect(() => {
    let active = true;
    contentApi
      .get('home', { credentials: 'omit' })
      .then((res) => {
        if (active && res?.data?.content?.data) {
          const d = res.data.content.data;
          setHome({ ...DEFAULT_HOME, ...d, statistics: d.statistics || DEFAULT_HOME.statistics, buttons: d.buttons || DEFAULT_HOME.buttons });
        }
      })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  // Live counts from the backend — replaces the hardcoded MoU / CSR totals so
  // public stats update automatically whenever an admin adds or removes a
  // published MOU or CSR project.
  useEffect(() => {
    let active = true;
    statsApi
      .getStats()
      .then((res) => {
        if (!active || !res?.data) return;
        const { mouCount, csrCount } = res.data;
        const base = home.statistics || DEFAULT_HOME.statistics;
        setHome((prev) => ({
          ...prev,
          statistics: [
            { ...(base[0] || {}), num: mouCount, label: 'Memorandums of Understanding (MoUs) signed' },
            { ...(base[1] || {}), num: csrCount, label: 'CSR projects delivered' },
            base[2] || { num: 2, label: 'Office locations — Coimbatore & Chennai' },
          ],
        }));
      })
      .catch(() => { });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FAQPage structured data — injected into <head> because script elements
  // created via innerHTML are not executed by browsers.
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'qaroo-faq');
    script.textContent = JSON.stringify(FAQ_SCHEMA);
    document.head.appendChild(script);
    return () => {
      const existing = document.head.querySelector('script[data-faq-schema="qaroo-faq"]');
      if (existing) existing.remove();
    };
  }, []);

  return (
    <>
      <Seo
        title="Qaroo India Private Limited — Business Solutions & Career-Ready Learning"
        description="Qaroo India Private Limited delivers business solutions — CRM, digital marketing, design, web & software development, strategy — plus career-ready IT learning programs. Head office Coimbatore, branch office Chennai."
        path="/"
      />
      {/* ========== HERO — WebThreads background ========== */}
      <section style={{
        background: 'var(--eduact-base)',
        color: '#fff',
        padding: '100px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.5,
        }}>
          <WebThreads
            color1="#931913"
            color2="#e4cc2e"
            color3="#ffffff"
            speed={0.15}
            threadCount={5}
            frequency={4.0}
            spread={0.22}
            taper={0.8}
            position={0.5}
            fanMode="center"
            glow={0.03}
            falloff={0.5}
            thickness={1.2}
            brightness={0.5}
            opacity={0.8}
            mirror={true}
            shimmer={false}
            grain={true}
            grainIntensity={0.04}
            mouseInteraction={true}
            mouseStrength={0.2}
          />
        </div>

        <Container style={{ position: 'relative', zIndex: 2 }}>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <p className="eyebrow">{home.heroEyebrow}</p>
              <div style={{ maxWidth: '640px', marginBottom: '16px' }}>
                <StrokeText
                  text={home.heroTitle}
                  strokeColor="#e4cc2e"
                  fillColor="#ffffff"
                  strokeWidth={1.4}
                  drawDuration={1.8}
                  fillDelay={0.3}
                  stagger={0.04}
                  ease="power2.out"
                  trigger="mount"
                  fillMode="wipe"
                  fontSize={48}
                  fontWeight={800}
                  letterSpacing={-1}
                />
              </div>
              <p style={{
                margin: '24px 0 36px',
                fontSize: '17px',
                color: 'rgba(255,255,255,0.75)',
                maxWidth: '520px',
              }}>
                {home.heroDescription}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {home.buttons.map((b) => (
                  <StarBorder
                  key={b.link + b.text}
                  as="span"
                  color="var(--eduact-black)"
                  speed={b.style === 'yellow' ? '4s' : '5s'}
                  thickness={2}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    transform: hoverBtn === b.text ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)',
                    boxShadow: hoverBtn === b.text ? '0 14px 34px rgba(42,37,77,0.4)' : '0 0 0 rgba(42,37,77,0)',
                    display: 'inline-block',
                  }}
                  onMouseEnter={() => setHoverBtn(b.text)}
                  onMouseLeave={() => setHoverBtn(null)}
                >
                    <Link to={b.link} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 26px',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                      textDecoration: 'none',
                      background: 'var(--eduact-black)',
                      borderRadius: '8px',
                    }}>
                      {b.text}
                    </Link>
                  </StarBorder>
                ))}
              </div>
            </Col>
            <Col lg={5} className="d-none d-lg-block">
              <div style={{ padding: '20px 0' }}>
                <svg viewBox="0 0 480 420" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
                  <circle cx="60" cy="40" r="5" fill="#F3F5F9" />
                  <text x="80" y="45" fill="rgba(255,255,255,0.5)" fontFamily="Urbanist, sans-serif" fontSize="12" fontWeight="600">QAROO INDIA PRIVATE LIMITED</text>
                  <path d="M60 55 C 60 140, 60 140, 60 170" stroke="rgba(255,255,255,0.2)" strokeWidth="2" fill="none" />
                  <path d="M60 170 C 60 220, 300 210, 380 280" stroke="#e4cc2e" strokeWidth="2" fill="none" />
                  <path d="M180 170 C 180 220, 40 230, 120 320" stroke="rgba(228,204,46,0.5)" strokeWidth="2" fill="none" />
                  <circle cx="60" cy="170" r="4" fill="#F3F5F9" />
                  <circle cx="380" cy="280" r="5" fill="#e4cc2e" />
                  <circle cx="120" cy="320" r="5" fill="rgba(228,204,46,0.7)" />
                  <text x="392" y="284" fill="#e4cc2e" fontFamily="Urbanist, sans-serif" fontSize="12" fontWeight="600">BUSINESS</text>
                  <text x="392" y="300" fill="rgba(255,255,255,0.5)" fontFamily="Urbanist, sans-serif" fontSize="11">strategy · design · tech</text>
                  <text x="10" y="340" fill="#e4cc2e" fontFamily="Urbanist, sans-serif" fontSize="12" fontWeight="600">LEARNING</text>
                  <text x="10" y="356" fill="rgba(255,255,255,0.5)" fontFamily="Urbanist, sans-serif" fontSize="11">skills · projects · career</text>
                </svg>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== TRUST STRIP — eduact-black ========== */}
      <div style={{
        background: 'var(--eduact-black)',
        borderTop: '1px solid rgba(228,204,46,0.15)',
        borderBottom: '1px solid rgba(228,204,46,0.15)',
      }}>
        <Container>
          <div className="d-flex justify-content-between gap-4 py-4 flex-wrap">
            {[
              { text: <><strong style={{ color: '#fff' }}>Coimbatore HQ</strong> + <strong style={{ color: '#fff' }}>Chennai branch office</strong></> },
              { text: <>Academic & CSR partnerships incl. <strong style={{ color: '#fff' }}>Infosys Foundation</strong>, <strong style={{ color: '#fff' }}>EduBridge</strong>, <strong style={{ color: '#fff' }}>Atos Prayas Foundation</strong></> },
              { text: <>{home.statistics[0]?.num ?? 20} MoUs across software, branding & digital marketing</> },
            ].map((item, i) => (
              <div key={i} className="d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13.5px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--eduact-secondary)', flexShrink: 0 }} />
                {item.text}
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ========== TWO PATHS ========== */}
      <section className="page-section">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Where business problems meet digital expertise</p>
              <h2>Two divisions, working from the same standard.</h2>
            </div>
            <p className="desc">Businesses need digital talent. Professionals need practical skills. Qaroo India Private Limited operates at the intersection of both.</p>
          </div>

          <div className="reveal" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2px',
            background: 'var(--eduact-soft4)',
            border: '1px solid var(--eduact-soft4)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            <GlareHover
              width="100%"
              height="100%"
              background="#fff"
              borderRadius="0"
              borderColor="transparent"
              glareColor="#e4cc2e"
              glareOpacity={0.15}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={false}
              style={{ padding: '44px 40px', display: 'block' }}
            >
              <p className="eyebrow">For businesses</p>
              <h3 style={{ fontSize: '26px', marginBottom: '14px' }}>Business Solutions</h3>
              <p style={{ color: 'var(--eduact-text)', fontSize: '15px', marginBottom: '22px', maxWidth: '420px' }}>
                Strategy, design and technology work for teams that need to grow, transform, or ship something real.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'grid', gap: '8px' }}>
                {['CRM strategy & implementation', 'Digital marketing & SEO', 'Branding & graphic design', 'Web & software development', 'UI/UX design & research', 'Business strategy & consulting'].map((item) => (
                  <li key={item} style={{ fontSize: '14px', color: 'var(--eduact-black)', paddingLeft: '18px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--eduact-base)' }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/business-solutions" className="btn-eduact">Explore Business</Link>
            </GlareHover>
            <GlareHover
              width="100%"
              height="100%"
              background="#fff"
              borderRadius="0"
              borderColor="transparent"
              glareColor="#e4cc2e"
              glareOpacity={0.15}
              glareAngle={-30}
              glareSize={300}
              transitionDuration={800}
              playOnce={false}
              style={{ padding: '44px 40px', display: 'block' }}
            >
              <p className="eyebrow">For learners</p>
              <h3 style={{ fontSize: '26px', marginBottom: '14px' }}>Learning Programs</h3>
              <p style={{ color: 'var(--eduact-text)', fontSize: '15px', marginBottom: '22px', maxWidth: '420px' }}>
                Industry-linked training across technology, design and analytics — built around real projects, not just lectures.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'grid', gap: '8px' }}>
                {['Data Science & Business Analytics', 'Full Stack Development', 'UI/UX Design', 'Cyber Security & Ethical Hacking', 'AI & Machine Learning', 'Graphic Design, Animation & VFX'].map((item) => (
                  <li key={item} style={{ fontSize: '14px', color: 'var(--eduact-black)', paddingLeft: '18px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--eduact-base)' }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/learning-programs" className="btn-eduact">Explore Courses</Link>
            </GlareHover>
          </div>
        </Container>
      </section>


      <section className="page-section dark" id="business">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">What we do</p>
              <h2>Work that moves a real metric.</h2>
            </div>
            <p className="desc muted">Every engagement is scoped around a business outcome — not a generic service list.</p>
          </div>

          <div className="reveal">
            <MagicBento
              cards={[
                { color: '#1a0a0a', title: 'Business Solutions', description: 'CRM, marketing, design, software and strategy — scoped around a business outcome.', label: 'For businesses', link: '/business-solutions' },
                { color: '#1a0a0a', title: 'Learning Programs', description: 'Industry-linked training across technology, design and analytics — built around real projects.', label: 'For learners', link: '/learning-programs' },
                { color: '#1a0a0a', title: 'CSR Projects', description: 'Workforce readiness, education access and digital empowerment — delivered through institutional partnerships.', label: 'CSR', link: '/csr-projects' },
                { color: '#1a0a0a', title: 'MOU Directory', description: `${home.statistics[0]?.num ?? 20} memorandums of understanding across software, branding and digital marketing.`, label: 'Partners', link: '/mou-directory' },
              ]}
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="147, 25, 19"
            />
          </div>
        </Container>
      </section>

      {/* ========== HOW WE WORK ========== */}
      <section className="page-section dark" style={{ paddingTop: 0 }}>
        <Container>
          <div className="section-head reveal" style={{ marginBottom: '36px' }}>
            <div>
              <p className="eyebrow">How we work</p>
              <h2 style={{ fontSize: '24px' }}>Discover → Analyze → Strategize → Implement → Measure → Optimize</h2>
            </div>
          </div>
          <div className="reveal-stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
            {[
              { n: '01', title: 'Discover', desc: 'Understand the real problem.' },
              { n: '02', title: 'Analyze', desc: 'Map constraints & opportunity.' },
              { n: '03', title: 'Strategize', desc: 'Define the approach.' },
              { n: '04', title: 'Implement', desc: 'Design & build the solution.' },
              { n: '05', title: 'Measure', desc: 'Check it against outcomes.' },
              { n: '06', title: 'Optimize', desc: 'Refine what\'s working.' },
            ].map((step) => (
              <div key={step.n} style={{ borderTop: '2px solid var(--eduact-secondary)', paddingTop: '16px' }}>
                <span style={{
                  fontFamily: 'var(--heading-font)',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  display: 'block',
                  marginBottom: '10px',
                }}>{step.n}</span>
                <h4 style={{ fontSize: '15px', color: '#fff', marginBottom: '6px' }}>{step.title}</h4>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ========== LEARNING PROGRAMS PREVIEW ========== */}
      <section className="page-section" id="learning">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Learning Programs</p>
              <h2>Skills that move your career forward.</h2>
            </div>
            <p className="desc">Practical, project-based training across technology, design and analytics — grouped by career path.</p>
          </div>

          <Row className="g-0 reveal-stagger" style={{
            background: 'var(--eduact-soft4)',
            border: '1px solid var(--eduact-soft4)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            {[
              { title: 'Data Science & Business Analytics', desc: 'Two focused tracks — Data Science and Business Analytics — for different roles and starting points.' },
              { title: 'Full Stack Development', desc: 'Python or Java-based full stack tracks covering frontend, backend, APIs and deployment.' },
              { title: 'UI/UX Design', desc: 'Research through prototyping, ending in a portfolio built from real projects.' },
              { title: 'Cyber Security & Ethical Hacking', desc: 'Security fundamentals through to hands-on ethical hacking practice.' },
              { title: 'Artificial Intelligence & Machine Learning', desc: 'Python, statistics, ML and deep learning fundamentals through applied projects.' },
              { title: 'Graphic Design, Animation & VFX', desc: 'Design fundamentals through 2D/3D animation and visual effects production.' },
            ].map((card, i) => (
              <Col key={i} xs={12} md={6} lg={4}>
                <GlareHover
                  width="100%"
                  height="100%"
                  background="#fff"
                  borderRadius="0"
                  borderColor="transparent"
                  glareColor="#e4cc2e"
                  glareOpacity={0.12}
                  glareAngle={-30}
                  glareSize={250}
                  transitionDuration={700}
                  playOnce={false}
                  style={{ display: 'block', padding: '32px 28px' }}
                >
                  <span className="idx">Career track</span>
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                  <Link to="/learning-programs" className="card-link">View curriculum →</Link>
                </GlareHover>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ========== PARTNERS & MoUs ========== */}
      <section className="page-section dark">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Trusted through real partnerships</p>
              <h2>Our Partners & MoUs</h2>
            </div>
            <p className="desc muted">Institutional and CSR relationships that back the CSR & training work.</p>
          </div>

          <div className="reveal-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '56px',
          }}>
            {home.statistics.map((stat, i) => (
              <div key={i} className="stat-card">
                <span className="stat-num">
                  {typeof stat.num === 'number'
                    ? <CountUp to={stat.num} separator="," duration={1.5} />
                    : stat.num}
                </span>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="eyebrow" style={{ marginBottom: '18px' }}>Company Partners</p>
          <div className="reveal-stagger" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 16px', paddingTop: '8px' }}>
            {(home.partners || []).map((p) => (
              <span key={p} className="partner-chip">{p}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* ========== CSR PROJECTS PREVIEW ========== */}
      <section className="page-section" id="csr">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">Corporate Social Responsibility</p>
              <h2>CSR Projects</h2>
            </div>
            <p className="desc">Programs delivered in partnership with our CSR & academic network, by year.</p>
          </div>

          <div className="reveal" style={{ display: 'flex', gap: '10px', marginBottom: '36px' }}>
            {['24-25', '25-26'].map((tab) => (
              <button
                key={tab}
                onClick={() => setCsrTab(tab)}
                style={{
                  padding: '11px 22px',
                  borderRadius: '999px',
                  border: '1px solid var(--eduact-soft4)',
                  fontFamily: 'var(--heading-font)',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  color: csrTab === tab ? '#fff' : 'var(--eduact-text)',
                  background: csrTab === tab ? 'var(--eduact-base)' : 'transparent',
                  borderColor: csrTab === tab ? 'var(--eduact-base)' : 'var(--eduact-soft4)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                20{tab}
              </button>
            ))}
          </div>

          {csrTab === '24-25' && (
            <Row className="g-0 reveal" style={{
              background: 'var(--eduact-soft4)',
              border: '1px solid var(--eduact-soft4)',
              borderRadius: '18px',
              overflow: 'hidden',
            }}>
              {[
                { tag: 'Skill Development', title: 'Workforce readiness training', desc: 'Delivered with EduBridge across partner institutions.' },
                { tag: 'Education Access', title: 'Campus skilling drive', desc: 'Run with Atos Prayas Foundation.' },
                { tag: 'Digital Empowerment', title: 'Community digital literacy', desc: 'Supported by Infosys Foundation CSR collaboration.' },
              ].map((item, i) => (
                <Col key={i} xs={12} md={4}>
                  <div style={{ background: '#fff', padding: '28px 26px' }}>
                    <span style={{
                      fontFamily: 'var(--heading-font)',
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--eduact-base)',
                    }}>{item.tag}</span>
                    <h4 style={{ fontSize: '17px', margin: '10px 0 8px' }}>{item.title}</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--eduact-text)', margin: 0 }}>{item.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          {csrTab === '25-26' && (
            <Row className="g-0 reveal" style={{
              background: 'var(--eduact-soft4)',
              border: '1px solid var(--eduact-soft4)',
              borderRadius: '18px',
              overflow: 'hidden',
            }}>
              {[
                { tag: 'Skill Development', title: 'Advanced workforce training', desc: 'Next-gen skilling programs with industry partners.' },
                { tag: 'Education Access', title: 'Rural digital classrooms', desc: 'Expanding access to quality education in rural Tamil Nadu.' },
                { tag: 'Placements', title: 'Industry connect program', desc: 'Direct placement partnerships with leading tech companies.' },
              ].map((item, i) => (
                <Col key={i} xs={12} md={4}>
                  <div style={{ background: '#fff', padding: '28px 26px' }}>
                    <span style={{
                      fontFamily: 'var(--heading-font)',
                      fontWeight: 600,
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--eduact-base)',
                    }}>{item.tag}</span>
                    <h4 style={{ fontSize: '17px', margin: '10px 0 8px' }}>{item.title}</h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--eduact-text)', margin: 0 }}>{item.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          )}

          <div className="d-flex flex-wrap justify-content-center mt-4" style={{ gap: '12px' }}>
            <Link to="/csr-projects" className="btn-eduact">View All CSR Projects</Link>
            <Link to="/mou-directory" className="btn-eduact-outline">View MOU Directory</Link>
          </div>
        </Container>
      </section>

      {/* ========== FAQ ========== */}
      <section className="page-section" style={{ paddingTop: 0 }}>
        <Container style={{ maxWidth: '820px' }}>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 style={{ fontSize: '26px' }}>Common questions</h2>
            </div>
          </div>

          <div className="reveal">
            <details className="faq-item" open>
              <summary>Do you work with businesses and train individuals at the same time?</summary>
              <p>Yes — Business Solutions and Learning are two divisions of the same organization, run to the same standard.</p>
            </details>
            <details className="faq-item">
              <summary>Where are you based?</summary>
              <p>Head office in Coimbatore, branch office in Chennai (Pallavaram). Both business and learning inquiries can reach either office.</p>
            </details>
            <details className="faq-item">
              <summary>How do I see your CSR project history?</summary>
              <p>The CSR Projects section above lists our programs by year — 2024–25 and 2025–26 — with full details added as each project is confirmed.</p>
            </details>
            <details className="faq-item">
              <summary>What is the MOU Directory?</summary>
              <p>Our MOU Directory documents every memorandum of understanding on record — who the partner is, what it can offer students, and our assessment of how strong the collaboration actually is.</p>
            </details>
          </div>
        </Container>
      </section>

      {/* ========== FINAL CTA ========== */}
      <div style={{ background: 'var(--eduact-black)', color: '#fff', padding: '80px 0' }}>
        <Container>
          <div className="section-head reveal" style={{ marginBottom: '28px' }}>
            <div>
              <p className="eyebrow">Get started</p>
              <h2 style={{ fontSize: '28px', color: '#fff' }}>Tell us which path you're on.</h2>
            </div>
          </div>

          <div className="reveal-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '40px', background: 'var(--eduact-black)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--eduact-black)'}
            >
              <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '10px' }}>I need business solutions</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '22px' }}>
                CRM, marketing, design, software, or strategy — tell us the problem and we'll scope it.
              </p>
              <Link to="/contact" className="btn-eduact-secondary">Talk to an Expert</Link>
            </div>
            <div style={{ padding: '40px', background: 'var(--eduact-black)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--eduact-black)'}
            >
              <h3 style={{ fontSize: '22px', color: '#fff', marginBottom: '10px' }}>I want to learn</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '22px' }}>
                Explore a career track and see the full curriculum before you commit.
              </p>
              <Link to="/contact" className="btn-eduact-secondary">Request Course Details</Link>
            </div>
          </div>
        </Container>
      </div>

      {/* ========== ABOUT PREVIEW ========== */}
      <section className="page-section dark" style={{ padding: '64px 0' }}>
        <Container className="reveal">
          <div className="d-flex justify-content-between align-items-center gap-4 flex-wrap">
            <div style={{ maxWidth: '560px' }}>
              <p className="eyebrow">About the company</p>
              <h3 style={{ color: '#fff', fontSize: '24px', marginTop: '12px' }}>One team, two divisions, headquartered in Coimbatore.</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '12px', fontSize: '14.5px' }}>
                Qaroo India Private Limited runs Business Solutions and Learning as two divisions of a single organization — built on real academic and CSR partnerships across Tamil Nadu and beyond.
              </p>
            </div>
            <Link to="/about" className="btn-eduact-outline" style={{ borderColor: 'rgba(255,255,255,0.24)', color: '#fff' }}>
              Read the full story →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
