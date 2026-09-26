import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ScrollExpand from '../components/ScrollExpand';
import Seo from '../components/Seo.jsx';
import ArchitecturalFrames from '../components/ArchitecturalFrames.jsx';
import BlueprintSectionTitle from '../components/BlueprintSectionTitle.jsx';
import FlipBook from '../components/FlipBook/FlipBook';
import Page from '../components/FlipBook/Page';
import TiltCard from '../components/TiltCard.jsx';
import { businessSolutionApi } from '../api/businessSolutionApi.js';
import { BUSINESS_SOLUTIONS } from '../data/businessSolutions.js';
import './business/BusinessSolutions.css';

// Shown until the published list arrives, and if that request fails. Derived
// from the same source the individual solution pages read, so the two cannot
// drift -- this list was hand-copied before and carried only a title and a
// description, which left the roadmap diagrams empty on the first paint.
const DEFAULT_SERVICES = BUSINESS_SOLUTIONS.map((s, i) => ({
  idx: String(i + 1).padStart(2, '0'),
  title: s.pageName,
  desc: s.shortDescription,
  slug: s.slug,
  process: s.process,
  problems: s.problems,
  benefits: s.benefits,
}));

/** Guarantees the arrays the roadmap cards read, whatever the source. */
const withRoadmap = (list) =>
  list.map((s) => ({ process: [], problems: [], benefits: [], ...s }));

export default function BusinessSolutions() {
  const [services, setServices] = useState(() => withRoadmap(DEFAULT_SERVICES));
  const [errors, setErrors] = useState('');

  useEffect(() => {
    let active = true;
    businessSolutionApi
      .list({}, { credentials: 'omit' })
      .then((res) => {
        if (!active) return;
        const list = res?.data?.solutions || [];
        if (list.length) {
          setServices(
            withRoadmap(
              list
                .filter((s) => s.status === 'published')
                .map((s, i) => ({
                  idx: String(i + 1).padStart(2, '0'),
                  title: s.pageName || s.title,
                  desc: s.shortDescription || s.fullDescription,
                  slug: s.slug,
                  // Read by the roadmap cards. Real content per solution, so
                  // each diagram states how that work actually runs rather
                  // than repeating a generic set of stages.
                  process: s.process,
                  problems: s.problems,
                  benefits: s.benefits,
                }))
            )
          );
        }
      })
      .catch(() => { if (active) setErrors('Some content could not be loaded and may be out of date.'); });
    return () => { active = false; };
  }, []);

  // Built once per solutions list: react-pageflip reads its children to build
  // the book, so a fresh array on every render would rebuild it mid-turn.
  // Covers are hard, and the count stays even so the back cover closes the
  // book on its own.
  // A book shows one leaf and hides the rest, so it needs to say where the
  // reader is and give them a way through that does not depend on discovering
  // that a corner can be dragged.
  const bookRef = useRef(null);
  const [leaf, setLeaf] = useState(0);

  const turn = useCallback((direction) => {
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    if (direction < 0) api.flipPrev();
    else api.flipNext();
  }, []);

  // The solutions request usually returns exactly what the fallback already
  // showed, but as a new array - and a new pages array makes react-pageflip
  // tear the book down and rebuild it, losing the reader's place. Keying the
  // memo on the content rather than the array identity means the book is only
  // rebuilt when something actually changed.
  const roadmapKey = services
    .map((s) => `${s.slug}:${s.title}:${s.process.length}`)
    .join('|');

  const roadmapPages = useMemo(() => {
    // The three brand colours, rotated leaf by leaf. Ink and accent per
    // colour are set in CSS; all three pass AA as page backgrounds. The
    // rotation is offset by one so the first page does not repeat the navy
    // front cover - opening the book should show a colour change.
    const TONES = ['rm-leaf--navy', 'rm-leaf--red', 'rm-leaf--gold'];
    const leaves = [
      <Page key="cover" hard className="rm-leaf--navy rm-leaf--cover">
        <div className="rm-cover">
          <span className="rm-cover__label">Roadmap</span>
          <h3 className="rm-cover__title">Eight stages, front to back.</h3>
          <p className="rm-cover__text">
            One page per solution: what it is, what it fixes, how we run it and
            what you end up with.
          </p>
          <p className="rm-cover__hint">Drag a corner, or click the edge, to turn the page.</p>
        </div>
      </Page>,
      ...services.map((s, i) => (
        <Page key={s.slug || s.title} className={TONES[(i + 1) % TONES.length]}>
          <span className="rm-page__stage">Stage {s.idx}</span>
          <h3 className="rm-page__title">{s.title}</h3>
          <span className="rm-page__rule" aria-hidden="true" />
          <p className="rm-page__desc">{s.desc}</p>

          {s.problems.length > 0 && (
            <div className="rm-page__block">
              <h4 className="rm-page__label">What this fixes</h4>
              <ul className="rm-list">
                {s.problems.slice(0, 2).map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            </div>
          )}

          {s.process.length > 0 && (
            <div className="rm-page__block">
              <h4 className="rm-page__label">How we run it</h4>
              <ol className="rm-flow">
                {s.process.map((step, n) => (
                  <li className="rm-flow__step" key={step.title || n}>
                    <span className="rm-flow__node" aria-hidden="true">{n + 1}</span>
                    <span className="rm-flow__body">
                      <span className="rm-flow__title">{step.title}</span>
                      {step.items?.[0] && (
                        <span className="rm-flow__detail">{step.items[0]}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {s.benefits.length > 0 && (
            <p className="rm-page__result">
              <span>What you end up with</span>
              {s.benefits[0]}
            </p>
          )}

          <Link
            to={s.slug ? `/business-solutions/${s.slug}` : '/business-solutions'}
            className="rm-page__cta"
          >
            {'Explore this stage ->'}
          </Link>
        </Page>
      )),
      <Page key="back" hard className="rm-leaf--red rm-leaf--cover">
        <div className="rm-cover">
          <span className="rm-cover__label">End of the roadmap</span>
          <h3 className="rm-cover__title">Start wherever you are.</h3>
          <p className="rm-cover__text">
            Most engagements begin at one stage and grow into the next. The full
            specifications for each are below.
          </p>
          <Link to="/contact" className="rm-cover__cta">{'Talk to our team ->'}</Link>
        </div>
      </Page>,
    ];
    // An odd leaf count leaves the back cover facing a blank; pad to even.
    if (leaves.length % 2 !== 0) {
      leaves.splice(leaves.length - 1, 0, <Page key="blank" />);
    }
    return leaves;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapKey]);

  return (
    <div className="business-template">
      <Seo
        title="Business Solutions - Qaroo India Private Limited | CRM, Marketing, Design, Software, Strategy"
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
          Every engagement is scoped around a business outcome - not a generic service list.
        </h2>
      </ScrollExpand>

      <Container className="page-section">
        {errors && (
          <div style={{
            background: 'rgba(244, 196, 48,0.12)',
            border: '1px solid var(--eduact-secondary)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '13px',
            color: 'var(--eduact-black)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            {errors}
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
              box-shadow: 0 4px 12px rgba(23, 42, 70,0.05);
              transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
              text-decoration: none;
            }
            .services-nav-link:hover {
              color: #fff;
              background: var(--eduact-base);
              border-color: var(--eduact-base);
              transform: translateY(-2px);
              box-shadow: 0 8px 18px rgba(179, 38, 45,0.25);
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
            <Link to="/business-solutions" className="services-nav-link is-home" style={{ textDecoration: 'none' }}>
              Business Solutions
            </Link>
            {services.map((s) => (
                <Link
                  key={s.idx || s.title}
                  to={s.slug ? `/business-solutions/${s.slug}` : '/business-solutions'}
                  className="services-nav-link"
                  style={{ textDecoration: 'none' }}
                >
                  {s.title}
                </Link>
              ))}
          </div>
        </nav>

        {/* Roadmap: the same eight solutions, in the same order, as a stack
            that assembles while you scroll. Driven by `services` so it can
            never fall out of step with the grid below it. */}
        <BlueprintSectionTitle
          eyebrow="Roadmap"
          title="The route through our solutions."
          aside={`${services.length} Stages`}
        />

        {/* The eight solutions as a book: one leaf per stage, covers front
            and back. Pages come from `services`, so the book follows whatever
            is published, in the same order as the grid below. */}
        <FlipBook
          ref={bookRef}
          className="solutions-roadmap"
          label="Our solutions roadmap, as a flip book"
          onFlip={(e) => setLeaf(e.data)}
        >
          {roadmapPages}
        </FlipBook>

        <div className="rm-controls">
          <button
            type="button"
            className="rm-controls__btn"
            onClick={() => turn(-1)}
            disabled={leaf === 0}
            aria-label="Previous page"
          >
            {'<-'}
          </button>

          <p className="rm-controls__where" aria-live="polite">
            {leaf === 0
              ? 'Front cover'
              : leaf >= roadmapPages.length - 1
                ? 'Back cover'
                : `Stage ${String(leaf).padStart(2, '0')} of ${String(services.length).padStart(2, '0')} - ${services[leaf - 1]?.title ?? ''}`}
          </p>

          <button
            type="button"
            className="rm-controls__btn"
            onClick={() => turn(1)}
            disabled={leaf >= roadmapPages.length - 1}
            aria-label="Next page"
          >
            {'->'}
          </button>
        </div>

        <p className="rm-controls__hint">
          Turn the page with the arrows, or drag a corner of the book.
        </p>
        <BlueprintSectionTitle
          eyebrow="Plan view"
          index="01"
          title="Our Solutions"
          aside="8 Specifications"
        />

        <Row className="g-4 reveal-stagger">
          {services.map((s) => {
            const detailPath = s.slug ? `/business-solutions/${s.slug}` : '/business-solutions';
            return (
            <Col key={s.idx || s.title} md={6} lg={4}>
              <TiltCard>
              <div className="af-card-wrap">
              <Link
                to={detailPath}
                className="eduact-card track-card"
                aria-label={`Open ${s.title} details`}
              >
                <span className="idx">{s.idx} / {s.title.split(' ')[0]}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </Link>
              </div>
              </TiltCard>
            </Col>
            );
          })}
        </Row>

        <div className="mt-5 pt-4 reveal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BlueprintSectionTitle
            eyebrow="Ready to start?"
            title="Let's discuss your business challenge."
            align="center"
            aside="Contact"
          />
          <Link to="/contact" className="btn-eduact">Get in Touch</Link>
        </div>
      </Container>
      {/* Architectural background */}
      <div className="af-blocks" aria-hidden="true">
        <ArchitecturalFrames />
      </div>
    </div>
  );
}
