import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Modal, Form } from 'react-bootstrap';
import Stepper, { Step } from '../components/Stepper';
import Seo from '../components/Seo.jsx';
import { LoadingState, EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { learningApi } from '../api/learningApi.js';
import { contentApi } from '../api/contentApi.js';
import { contactApi } from '../api/contactApi.js';

const DEFAULT_LEARNING_STEPS = [
  { title: 'Connect', desc: 'Browse our career tracks and submit an enquiry. Our team will reach out within 24 hours to discuss your background and goals.' },
  { title: 'Evaluate', desc: 'We assess your current skills and learning needs to recommend the right track and pace for your journey.' },
  { title: 'Mentor', desc: 'Speak one-on-one with our career counselor to finalize the best track for your goals, batch timing, duration and fee structure.' },
  { title: 'Lock It In', desc: 'Complete your enrollment with flexible payment options. Get access to pre-reading materials and orientation.' },
  { title: 'Upskill', desc: 'Hands-on projects, live sessions, and mentorship from industry professionals. Build your portfolio as you learn.' },
  { title: 'Ace', desc: 'Complete your capstone project and earn your certification. Our placement support helps you land your next role.' },
];

export default function LearningPrograms() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState({});
  const [enrollTrack, setEnrollTrack] = useState(null);
  const [enrollForm, setEnrollForm] = useState({ name: '', email: '', phone: '' });
  const [sending, setSending] = useState(false);
  const aliveRef = useRef(true);
  const toast = useToast();

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    learningApi
      .list({}, { credentials: 'omit' })
      .then((res) => { if (aliveRef.current) setTracks(res.data.programs || []); })
      .catch((err) => { if (aliveRef.current) setError(err?.message || 'We could not load the programs. Please try again.'); })
      .finally(() => { if (aliveRef.current) setLoading(false); });
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    reload();
    contentApi
      .get('learning', { credentials: 'omit' })
      .then((res) => { if (aliveRef.current) setContent(res?.data?.content?.data || {}); })
      .catch(() => {});
    return () => { aliveRef.current = false; };
  }, [reload]);

  const links = Array.isArray(content.links) ? content.links.filter(Boolean) : [];
  const steps = Array.isArray(content.steps) && content.steps.length > 0 ? content.steps : DEFAULT_LEARNING_STEPS;

  const openEnroll = (track) => {
    setEnrollForm({ name: '', email: '', phone: '' });
    setEnrollTrack(track);
  };

  const handleEnrollChange = (e) => {
    setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value });
  };

  const submitEnroll = async (e) => {
    e.preventDefault();
    if (!enrollTrack) return;
    setSending(true);
    try {
      await contactApi.submit({
        name: enrollForm.name,
        email: enrollForm.email,
        phone: enrollForm.phone,
        interest: 'learning',
        message: `Enquiry for the "${enrollTrack.title}" learning program.`,
      });
      toast.success('Enquiry received. Our team will reach out within 24 hours.');
      setEnrollTrack(null);
    } catch (err) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Learning Programs & Career Tracks — Qaroo India Private Limited | Data Science, Full Stack, UI/UX, Cyber Security, AI"
        description="Career-ready IT learning programs from Qaroo India Private Limited: Data Science & Business Analytics, Full Stack Development, UI/UX Design, Cyber Security, AI & Machine Learning, Graphic Design and Software Testing."
        path="/learning-programs"
      />
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
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow">Learning Programs</span>
          <h1 style={{
            fontFamily: 'var(--heading-font)',
            fontWeight: 800,
            color: '#fff',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginTop: '10px',
          }}>{content.heading || 'Skills that move your career forward.'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '560px', marginTop: '14px' }}>
            {content.description || 'Practical, project-based training across technology, design and analytics — grouped by career path.'}
          </p>
        </Container>
      </div>

      {/* Enrollment Stepper */}
      <section className="page-section">
        <Container>
          <div className="section-head reveal">
            <div>
              <p className="eyebrow">{content.eyebrow || 'The Qaroo Launchpad'}</p>
              <h2>{content.stepperHeading || 'From enquiry to certification in 6 steps.'}</h2>
            </div>
            <p className="desc">{content.stepperDesc || 'Our structured enrollment process ensures you get the right training for your career goals.'}</p>
          </div>

          <div className="reveal" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <Stepper
              initialStep={1}
              backButtonText="Previous"
              nextButtonText="Next"
            >
              {steps.map((s, i) => (
                <Step key={s.title || i}>
                  <h2 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--eduact-black)' }}>Step {i + 1}: {s.title}</h2>
                  <p style={{ color: 'var(--eduact-text)', fontSize: '15px' }}>
                    {s.desc}
                  </p>
                </Step>
              ))}
            </Stepper>
          </div>
        </Container>
      </section>

      <Container className="page-section" style={{ paddingTop: 0 }}>
        <div className="reveal">
          <p className="eyebrow">Available Career Tracks</p>
          <h2 style={{ fontSize: '28px', marginBottom: '36px' }}>Choose your path</h2>
        </div>
        <Row className="g-4 reveal-stagger">
          {loading ? (
            <div style={{ width: '100%' }}><LoadingState label="Loading career tracks..." /></div>
          ) : error ? (
            <div style={{ width: '100%' }}><ErrorState title="Couldn't load programs" text={error} onRetry={reload} /></div>
          ) : tracks.length === 0 ? (
            <div style={{ width: '100%' }}>
              <EmptyState
                title="Programs coming soon"
                text="No learning programs are published right now. Check back shortly, or contact us for the full curriculum."
                action={<Link to="/contact" className="btn-eduact">Contact Us</Link>}
              />
            </div>
          ) : tracks.map((track, i) => (
            <Col key={i} md={6} lg={4}>
              <div className="eduact-card" style={{ height: '100%', borderTop: '3px solid var(--eduact-base)' }}>
                <span className="idx">Career Track {String(i + 1).padStart(2, '0')}</span>
                <h4>{track.title}</h4>
                <p>{track.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {(track.skills || []).map((skill) => (
                    <span key={skill} style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--eduact-base)',
                      background: 'var(--eduact-soft3)',
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}>{skill}</span>
                  ))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button
                    type="button"
                    className="btn-eduact"
                    style={{ fontSize: '13px', padding: '9px 16px' }}
                    onClick={() => openEnroll(track)}
                  >
                    Get course details
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="mt-5 pt-4 reveal text-center">
          <p className="eyebrow">Ready to upskill?</p>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Request the full curriculum.</h2>
          <Link to="/contact" className="btn-eduact">Request Course Details</Link>
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

      <Modal show={!!enrollTrack} onHide={() => setEnrollTrack(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontFamily: 'var(--heading-font)', fontSize: '18px' }}>
            {enrollTrack ? `Request details — ${enrollTrack.title}` : 'Request details'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={submitEnroll}>
          <Modal.Body>
            <p style={{ fontSize: '14px', color: 'var(--eduact-text)' }}>
              Tell us a little about yourself and our team will send the full curriculum, pricing and next steps.
            </p>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '14px', fontWeight: 600 }}>Name</Form.Label>
              <Form.Control type="text" name="name" value={enrollForm.name} onChange={handleEnrollChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '14px', fontWeight: 600 }}>Email</Form.Label>
              <Form.Control type="email" name="email" value={enrollForm.email} onChange={handleEnrollChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ fontSize: '14px', fontWeight: 600 }}>
                Phone <span style={{ fontWeight: 400, color: 'var(--eduact-text)' }}>(optional)</span>
              </Form.Label>
              <Form.Control type="tel" name="phone" value={enrollForm.phone} onChange={handleEnrollChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className="btn-eduact-outline" onClick={() => setEnrollTrack(null)}>Cancel</button>
            <button type="submit" className="btn-eduact" disabled={sending}>
              {sending ? 'Sending...' : 'Send enquiry'}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
