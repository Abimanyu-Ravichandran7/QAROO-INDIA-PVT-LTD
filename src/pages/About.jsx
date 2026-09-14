import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import GlareHover from '../components/GlareHover';
import CountUp from '../components/CountUp';
import Seo from '../components/Seo.jsx';
import { contentApi } from '../api/contentApi.js';
import { statsApi } from '../api/statsApi.js';
import { PARTNERS } from '../data/partners.js';

const DEFAULT_ABOUT = {
  visionTitle: 'To be a catalyst for digital transformation',
  visionBody:
    'Empowering businesses and individuals through innovative software solutions, creative design, and impactful learning experiences. We believe technology should solve real problems and education should lead to real careers.',
  missionTitle: 'Three pillars that drive everything',
  pillars: [
    'Develop cutting-edge software that solves real-world problems with precision and scalability.',
    'Design intuitive and memorable digital experiences that elevate brand identity.',
    'Deliver practical, industry-linked training that turns learners into professionals.',
  ],
  milestones: [
    { title: 'CSR Collaborations', desc: 'Partnered with EduBridge, a leading CSR implementation partner working alongside prestigious organizations such as Infosys Foundation, Atos Prayas Foundation, Capgemini, Standard Chartered, Canara Bank, and others.' },
    { title: '20+ MoUs Signed', desc: 'Strategic alliances with a diverse range of prestigious companies and organizations, empowering us to broaden capabilities and extend our reach across software development, branding, and digital marketing.' },
    { title: 'Honors & Recognition', desc: 'In 2024, Mrs. Suganya Priya Gobinath was honored with the prestigious "Lifetime Achiever" Award by the World Women\'s Association, recognizing outstanding contributions in software development, branding, and digital empowerment.' },
  ],
  partners: PARTNERS,
  stats: [
    { num: 20, label: 'MoUs signed' },
    { num: 12, label: 'CSR projects delivered' },
    { num: 2, label: 'Office locations' },
    { num: 1500, label: 'Students impacted' },
  ],
};

export default function About() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    let active = true;
    contentApi
      .get('about', { credentials: 'omit' })
      .then((res) => {
        if (active && res?.data?.content?.data) {
          const d = res.data.content.data;
          setAbout({ ...DEFAULT_ABOUT, ...d, pillars: d.pillars || DEFAULT_ABOUT.pillars, milestones: d.milestones || DEFAULT_ABOUT.milestones, partners: d.partners || DEFAULT_ABOUT.partners });
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Live counts from the backend — keeps the MoU / CSR totals auto-updating
  // whenever an admin adds or removes a published MOU or CSR project.
  useEffect(() => {
    let active = true;
    statsApi
      .getStats()
      .then((res) => {
        if (!active || !res?.data) return;
        const { mouCount, csrCount } = res.data;
        setAbout((prev) => {
          const base = prev.stats || DEFAULT_ABOUT.stats;
          const milestones = (prev.milestones || []).map((m) =>
            m.title.startsWith('20+ MoUs')
              ? { ...m, title: `${mouCount}+ MoUs Signed` }
              : m
          );
          return {
            ...prev,
            milestones,
            stats: [
              { ...(base[0] || {}), num: mouCount, label: 'MoUs signed' },
              { ...(base[1] || {}), num: csrCount, label: 'CSR projects delivered' },
              base[2] || { num: 2, label: 'Office locations' },
              base[3] || { num: 1500, label: 'Students impacted' },
            ],
          };
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <>
      <Seo
        title="About Us — Qaroo India Private Limited | Digital Solutions & Career Training"
        description={`Learn about Qaroo India Private Limited: our vision, mission, milestones and our impact by the numbers — ${about.stats[0]?.num ?? 20} MoUs signed and ${about.stats[1]?.num ?? 12} CSR projects delivered.`}
        path="/about"
      />
      {/* Header */}
      <div style={{
        background: 'var(--eduact-base)',
        padding: '80px 0 100px',
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
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)',
        }} />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow">About Us</span>
          <h1 style={{
            fontFamily: 'var(--heading-font)',
            fontWeight: 800,
            color: '#fff',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginTop: '10px',
          }}>Building digital solutions.<br />Building careers.</h1>
        </Container>
      </div>

      <Container className="page-section">
        <Row className="g-5">
          <Col lg={6}>
            <div className="reveal">
              <p className="eyebrow">Our Vision</p>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>{about.visionTitle}</h2>
              <p style={{ color: 'var(--eduact-text)', fontSize: '15px', lineHeight: 1.7 }}>
                {about.visionBody}
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <div className="reveal">
              <p className="eyebrow">Our Mission</p>
              <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>{about.missionTitle}</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                {(about.pillars || []).map((item, i) => (
                  <li key={i}>
                    <GlareHover
                      width="100%"
                      height="auto"
                      background="var(--eduact-soft5)"
                      borderRadius="14px"
                      borderColor="var(--eduact-soft4)"
                      glareColor="#e4cc2e"
                      glareOpacity={0.15}
                      glareAngle={-30}
                      glareSize={200}
                      transitionDuration={500}
                      playOnce={false}
                    >
                      <div style={{
                        fontSize: '15px',
                        color: 'var(--eduact-text)',
                        paddingLeft: '24px',
                        position: 'relative',
                        lineHeight: 1.7,
                        padding: '18px 20px 18px 44px',
                        textAlign: 'left',
                        width: '100%',
                      }}>
                        <span style={{
                          position: 'absolute',
                          left: '20px',
                          color: 'var(--eduact-base)',
                          fontWeight: 700,
                        }}>—</span>
                        {item}
                      </div>
                    </GlareHover>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>

        {/* Milestones */}
        <div className="mt-5 pt-5 reveal">
          <p className="eyebrow">Our Milestones</p>
          <h2 style={{ fontSize: '28px', marginBottom: '36px' }}>Key achievements that define our journey</h2>
          <Row className="g-4">
            {(about.milestones || []).map((m, i) => (
              <Col key={i} md={4}>
                <div className="eduact-card" style={{ height: '100%', borderTop: '3px solid var(--eduact-base)' }}>
                  <h4 style={{ color: 'var(--eduact-base)' }}>{m.title}</h4>
                  <p>{m.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Prestigious Partners */}
        <div className="mt-5 pt-5 reveal">
          <p className="eyebrow">Our Prestigious Partners</p>
          <h2 style={{ fontSize: '28px', marginBottom: '36px' }}>Organizations that trust us</h2>

          <Row className="g-4">
            {about.partners.map((p, i) => (
              <Col key={i} md={6} lg={3}>
                <div className="eduact-card" style={{ height: '100%', textAlign: 'center' }}>
                  {p.image ? (
                    <div style={{
                      height: '70px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      background: '#fff',
                      borderRadius: '10px',
                      border: '1px solid var(--eduact-soft4)',
                      padding: '8px 10px',
                    }}>
                      <img src={p.image} alt={p.name} style={{ maxHeight: '56px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'var(--eduact-base)',
                      color: '#fff',
                      fontFamily: 'var(--heading-font)',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}>{p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                  )}
                  <h4 style={{ fontSize: '16px' }}>{p.name}</h4>
                  <p style={{ fontSize: '13px' }}>{p.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Stats */}
        <div className="mt-5 pt-5 reveal">
          <p className="eyebrow">By the Numbers</p>
          <h2 style={{ fontSize: '28px', marginBottom: '36px' }}>Our impact in figures</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2px',
            background: 'var(--eduact-soft4)',
            border: '1px solid var(--eduact-soft4)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {(about.stats || []).map((stat, i) => {
              const raw = stat.num;
              const numeric = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
              const isNum = Number.isFinite(numeric);
              return (
                <div key={i} className="stat-card">
                  <span className="stat-num">{isNum ? <CountUp to={numeric} separator="," duration={1.5} /> : raw}</span>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </>
  );
}
