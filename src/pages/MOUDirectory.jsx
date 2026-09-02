import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Container, Row, Col, Modal, Carousel, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/States';
import { mouApi } from '../api/mouApi.js';
import { contentApi } from '../api/contentApi.js';

const DEFAULT_MOU_PAGE = {
  eyebrow: 'Institutional Partnerships',
  title: 'MOU Directory',
  description: 'Every memorandum of understanding on record — who the partner is, what it can offer students, and our read on how strong the collaboration actually is.',
};

function initials(name) {
  const safe = name || '';
  const leadWord = safe.split(/[\s(]/)[0];
  if (/^[A-Z]{3,6}$/.test(leadWord)) return leadWord;
  const skip = new Set(['of', 'and', 'the', 'for', '&', 'a', 'an', 'pvt.', 'pvt', 'ltd.', 'ltd', 'college', 'university']);
  const clean = safe.replace(/[()]/g, '');
  const words = clean.split(/\s+/).filter(w => w && !skip.has(w.toLowerCase()));
  const letters = (words.length ? words : clean.split(/\s+/)).map(w => (w[0] || '').toUpperCase());
  return letters.slice(0, 4).join('');
}

function logoSize(text) {
  return text.length >= 5 ? { fontSize: '0.72rem', letterSpacing: '0' } : text.length === 4 ? { fontSize: '0.82rem' } : {};
}

// Map known MOU partner names to their logo files in /logos.
const LOGO_MAP = [
  { match: ['snscollegeofengineering'], logo: '/logos/sns.png' },
  { match: ['rajalakshmi'], logo: '/logos/dsra.png' },
  { match: ['edubridge'], logo: '/logos/edubridge.png' },
  { match: ['aisect'], logo: '/logos/aisect.jpg' },
  { match: ['scopeglobalskillsuniversity'], logo: '/logos/scope.png' },
  { match: ['skilldevelopmentnetwork'], logo: '/logos/sdn.png' },
  { match: ['ranganathar'], logo: '/logos/srie.jpg' },
  { match: ['nspcareerpoint'], logo: '/logos/nsp.jpg' },
  { match: ['nsdc'], logo: '/logos/nsdc.jpg' },
  { match: ['ncvet'], logo: '/logos/ncvet.jpg' },
  { match: ['medhavi'], logo: '/logos/medhavi.png' },
  { match: ['gurukul'], logo: '/logos/igec.png' },
  { match: ['christtheking'], logo: '/logos/ckp.png' },
  { match: ['avp'], logo: '/logos/avp.jpg' },
];

function logoFor(name) {
  const n = (name || '').toLowerCase().replace(/[^a-z]/g, '');
  for (const entry of LOGO_MAP) {
    if (entry.match.some((m) => n.includes(m))) return entry.logo;
  }
  return null;
}

function PartnerLogo({ name, logo, size = 48, radius = 12, light = false }) {
  const img = logo || logoFor(name);
  if (!img) {
    const init = initials(name);
    return (
      <span style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: light ? '#fff' : 'var(--eduact-base)',
        color: light ? 'var(--eduact-base)' : '#fff',
        fontFamily: 'var(--heading-font)',
        fontWeight: 800,
        fontSize: '0.95rem',
        letterSpacing: '0.01em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        flexShrink: 0,
        boxShadow: light ? '0 6px 16px rgba(42,37,77,0.18)' : 'none',
        ...logoSize(init),
      }}>{init}</span>
    );
  }
  return (
    <span style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: '#fff',
      border: '1px solid var(--eduact-soft4)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px',
      flexShrink: 0,
      overflow: 'hidden',
      padding: '4px',
      boxShadow: light ? '0 6px 16px rgba(42,37,77,0.18)' : 'none',
    }}>
      <img src={img} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
    </span>
  );
}

// Full-width partner logo banner shown at the top of each MOU card.
function PartnerBanner({ name, logo }) {
  const src = logo || logoFor(name);
  const init = initials(name);
  return (
    <div style={{
      width: '100%',
      height: '88px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid var(--eduact-soft4)',
      padding: '10px',
      marginBottom: '18px',
      overflow: 'hidden',
    }}>
      {src ? (
        <img src={src} alt={name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
      ) : (
        <span style={{
          fontFamily: 'var(--heading-font)',
          fontWeight: 800,
          fontSize: '1.5rem',
          letterSpacing: '0.02em',
          color: 'var(--eduact-base)',
          ...logoSize(init),
        }}>{init}</span>
      )}
    </div>
  );
}

export default function MOUDirectory() {
  const [activeTag, setActiveTag] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [mous, setMous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(DEFAULT_MOU_PAGE);
  const aliveRef = useRef(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    mouApi
      .list({}, { credentials: 'omit' })
      .then((res) => {
        if (aliveRef.current) setMous(res.data.mous || []);
      })
      .catch((err) => {
        if (aliveRef.current) setError(err?.message || 'We could not load the MOU directory. Please try again.');
      })
      .finally(() => {
        if (aliveRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    reload();
    contentApi.get('mou', { credentials: 'omit' })
      .then((res) => { if (aliveRef.current) setContent({ ...DEFAULT_MOU_PAGE, ...(res.data.content.data || {}) }); })
      .catch(() => {});
    return () => {
      aliveRef.current = false;
    };
  }, [reload]);

  const tags = useMemo(() => ["All", ...new Set(mous.map(m => m.tag).filter(Boolean))], [mous]);

  const filtered = useMemo(() => {
    if (activeTag === 'All') return mous;
    return mous.filter(m => m.tag === activeTag);
  }, [activeTag, mous]);

  const openModal = (index) => {
    setModalIndex(index);
    setShowModal(true);
  };

  const m = mous[modalIndex];

  // If the MOUs change (e.g. a refresh) such that the open modal's index is no
  // longer valid, close the modal instead of leaving a blank shell.
  useEffect(() => {
    if (showModal && modalIndex >= mous.length) {
      setShowModal(false);
    }
  }, [showModal, modalIndex, mous.length]);

  return (
    <>
      <Seo
        title="MOU Directory — Qaroo India Private Limited | Institutional & CSR Partnerships"
        description="Browse 20+ Memorandums of Understanding signed by Qaroo India Private Limited with academic institutions and CSR partners across software development, branding and digital marketing."
        path="/mou-directory"
      />
      {/* Header */}
      <div style={{
        background: 'var(--eduact-base)',
        padding: '56px 0 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          content: '""',
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228,204,46,0.35), transparent 70%)',
        }} />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--eduact-secondary)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.78rem',
            marginBottom: '14px',
          }}>
            <span style={{ width: '26px', height: '2px', background: 'var(--eduact-secondary)', display: 'inline-block' }} />
            {content.eyebrow}
          </span>
          <h1 style={{
            fontFamily: 'var(--heading-font)',
            fontWeight: 800,
            color: '#fff',
            fontSize: 'clamp(1.9rem, 4vw, 2.7rem)',
            marginBottom: '10px',
          }}>{content.title}</h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            maxWidth: '640px',
            fontSize: '1rem',
            margin: 0,
          }}>{content.description}</p>
        </Container>
      </div>

      {/* Filter Chips */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        margin: '-28px auto 40px',
        maxWidth: '1140px',
        padding: '0 12px',
        position: 'relative',
        zIndex: 2,
      }}>
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTag(t)}
            style={{
              border: 'none',
              background: activeTag === t ? 'var(--eduact-base)' : '#fff',
              color: activeTag === t ? '#fff' : 'var(--eduact-text)',
              fontWeight: 600,
              fontSize: '0.82rem',
              padding: '9px 18px',
              borderRadius: '999px',
              boxShadow: '0 6px 18px rgba(42,37,77,0.08)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <Container style={{ maxWidth: '1140px', padding: '0 12px 80px' }}>
        <Row className="g-3">
          {loading ? (
            <div style={{ width: '100%' }}><LoadingState label="Loading partners..." /></div>
          ) : error ? (
            <div style={{ width: '100%' }}><ErrorState title="Couldn't load the directory" text={error} onRetry={reload} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ width: '100%' }}>
              <EmptyState
                title="No MOUs in this category"
                text="We partner with new institutions regularly — check back soon, or contact us to explore a collaboration."
                action={<Link to="/contact" className="btn-eduact">Start a partnership</Link>}
              />
            </div>
          ) : filtered.map((item, i) => {
            const init = initials(item.name);
            return (
              <Col key={item.name} xs={12} sm={6} lg={4}>
                <div
                  onClick={() => openModal(mous.indexOf(item))}
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    padding: '26px 24px 22px',
                    height: '100%',
                    border: '1px solid var(--eduact-soft4)',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(42,37,77,0.1)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'var(--eduact-soft4)';
                  }}
                >
                  <PartnerBanner name={item.name} logo={item.logo} />
                  <Badge style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--eduact-base)',
                    background: 'var(--eduact-soft3)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    marginBottom: '12px',
                    width: 'fit-content',
                  }}>{item.tag}</Badge>
                  <h3 style={{
                    fontFamily: 'var(--heading-font)',
                    fontWeight: 700,
                    fontSize: '1.08rem',
                    color: 'var(--eduact-black)',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                  }}>{item.name}</h3>
                  <p style={{
                    color: 'var(--eduact-text)',
                    fontSize: '0.89rem',
                    lineHeight: 1.55,
                    marginBottom: '18px',
                    flexGrow: 1,
                  }}>{item.blurb}</p>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--eduact-base)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    View MOU details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </span>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
        {m && (
          <>
            <div style={{
              background: 'var(--eduact-base)',
              padding: '30px 32px',
              position: 'relative',
              borderRadius: '20px 20px 0 0',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: '22px',
                  right: '26px',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >×</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <PartnerLogo name={m.name} logo={m.logo} size={60} radius={16} light />
                <div>
                  <Badge style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--eduact-black)',
                    background: 'var(--eduact-secondary)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    marginBottom: '6px',
                  }}>{m.tag}</Badge>
                  <h3 style={{
                    fontFamily: 'var(--heading-font)',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.5rem',
                    margin: '6px 0 0',
                  }}>{m.name}</h3>
                </div>
              </div>
            </div>

            <Modal.Body style={{ padding: '30px 32px 8px' }}>
              <Row className="g-4">
                <Col xs={12} lg={7} className="order-2 order-lg-1">
                  {(m.sections || []).map((s, idx) => (
                    <div key={idx} style={{ marginBottom: '26px' }}>
                      <div style={{
                        fontFamily: 'var(--heading-font)',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: 'var(--eduact-black)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <span style={{
                          width: '4px',
                          height: '16px',
                          background: 'var(--eduact-base)',
                          borderRadius: '2px',
                          display: 'inline-block',
                        }} />
                        {s.heading}
                      </div>

                      {s.paragraphs && s.paragraphs.map((p, pi) => (
                        <p key={pi} style={{ color: 'var(--eduact-text)', fontSize: '0.93rem', lineHeight: 1.65 }}>{p}</p>
                      ))}

                      {s.list && (
                        <ul className="mou-section-list" style={{
                          listStyle: 'none',
                          margin: 0,
                          padding: 0,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '8px 14px',
                        }}>
                          {s.list.map((li, liIdx) => (
                            <li key={liIdx} style={{
                              fontSize: '0.88rem',
                              color: 'var(--eduact-black)',
                              background: 'var(--eduact-soft)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--eduact-base)',
                                flexShrink: 0,
                              }} />
                              {li}
                            </li>
                          ))}
                        </ul>
                      )}

                      {s.pathway && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'var(--eduact-soft2)',
                          borderLeft: '4px solid var(--eduact-base)',
                          borderRadius: '10px',
                          padding: '16px 18px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--eduact-black)',
                        }}>
                          {s.pathway.map((p, pi) => (
                            <span key={pi} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {pi > 0 && <span style={{ color: 'var(--eduact-grey)', fontWeight: 400 }}>→</span>}
                              <span>{p}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {s.note && (
                        <div style={{
                          background: 'rgba(228,204,46,0.12)',
                          border: '1px solid rgba(228,204,46,0.3)',
                          color: 'var(--eduact-black)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          fontSize: '0.88rem',
                          lineHeight: 1.55,
                          marginTop: '12px',
                        }}>
                          <strong style={{ color: 'var(--eduact-base)' }}>Note:</strong> {s.note}
                        </div>
                      )}
                    </div>
                  ))}
                </Col>

                <Col xs={12} lg={5} className="order-1 order-lg-2">
                  <Carousel style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    {(m.images || []).map((src, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          src={src}
                          alt={`${m.name} ${idx + 1}`}
                          style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '16px' }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </Col>
              </Row>
            </Modal.Body>

            <Modal.Footer style={{ border: 'none', padding: '0 32px 28px' }}>
              <button className="btn-eduact" onClick={() => setShowModal(false)}>Close</button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style>{`
        @media (max-width: 575px) {
          ul.mou-section-list {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
