import { Container, Row, Col, Accordion, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { COMPANY } from '../../data/company.js';

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="section-head reveal">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {desc && <p className="desc">{desc}</p>}
    </div>
  );
}

function ChipList({ items }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item) => (
        <span
          key={item}
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: 'var(--eduact-base)',
            background: 'var(--eduact-soft3)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(147,25,19,0.1)',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function CheckList({ items, cols = 2 }) {
  return (
    <Row>
      {items.map((item) => (
        <Col key={item} xs={12} md={6} lg={cols === 3 ? 4 : 6} style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14.5px', color: 'var(--eduact-text)' }}>
            <span style={{ color: 'var(--eduact-secondary)', fontWeight: 800, marginTop: '1px' }}>✓</span>
            <span>{item}</span>
          </div>
        </Col>
      ))}
    </Row>
  );
}

function CardList({ items, numPrefix }) {
  return (
    <Row className="g-3">
      {items.map((item, i) => (
        <Col xs={12} md={6} lg={4} key={item}>
          <div style={{
            border: '1px solid var(--eduact-soft4)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--eduact-black)',
            height: '100%',
            background: 'var(--eduact-white)',
          }}>
            {numPrefix && <span className="idx">{numPrefix}{String(i + 1).padStart(2, '0')}</span>}
            {item}
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default function BusinessSolutionTemplate({ solution, otherSolutions }) {
  const path = `/business-solutions/${solution.slug}`;

  return (
    <>
      <Seo
        title={solution.metaTitle}
        description={solution.metaDescription}
        path={path}
      />

      {/* Hero */}
      <div style={{
        background: 'var(--eduact-base)',
        padding: '56px 0 72px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(228,204,46,0.35), transparent 70%)',
        }} />
        <Container style={{ position: 'relative', zIndex: 2 }}>
          <Breadcrumb style={{ marginBottom: '14px' }}>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }} style={{ color: 'rgba(255,255,255,0.6)' }}>
              Home
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/business-solutions' }} style={{ color: 'rgba(255,255,255,0.6)' }}>
              Business Solutions
            </Breadcrumb.Item>
            <Breadcrumb.Item active style={{ color: '#fff' }}>
              {solution.pageName}
            </Breadcrumb.Item>
          </Breadcrumb>
          <span className="eyebrow">Business Solution</span>
          <h1 style={{
            fontFamily: 'var(--heading-font)',
            fontWeight: 800,
            color: '#fff',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginTop: '10px',
          }}>{solution.pageName}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '640px', marginTop: '14px', fontSize: '16px' }}>
            {solution.shortDescription}
          </p>
          <div style={{ marginTop: '22px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-eduact" style={{ background: 'var(--eduact-secondary)', color: 'var(--eduact-black)' }}>
              Discuss Your Project
            </Link>
            <Link to="/business-solutions" className="btn-eduact-outline" style={{ color: '#fff' }}>
              View All Solutions
            </Link>
          </div>
        </Container>
      </div>

      {/* Introduction */}
      <section className="page-section">
        <Container>
          <div className="reveal" style={{ maxWidth: '860px' }}>
            <p className="eyebrow">Overview</p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 36px)', color: 'var(--eduact-black)', marginBottom: '20px' }}>
              {solution.pageName} from Qaroo India
            </h2>
            {solution.fullDescription.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: '15.5px', lineHeight: 1.8, color: 'var(--eduact-text)', marginBottom: '16px' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Services */}
          <div className="mt-5 reveal">
            <SectionTitle eyebrow="What we do" title="Key services" />
            <CardList items={solution.services} />
          </div>
        </Container>
      </section>

      {/* Business problems + our solution */}
      <section className="page-section" style={{ background: 'var(--eduact-soft2)' }}>
        <Container>
          <Row className="g-5">
            <Col md={6}>
              <p className="eyebrow">The challenge</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Business problems we solve</h3>
              <CheckList items={solution.problems} cols={1} />
            </Col>
            <Col md={6}>
              <p className="eyebrow">Our approach</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>How we solve them</h3>
              <CheckList items={solution.solutions} cols={1} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features + Benefits */}
      <section className="page-section">
        <Container>
          <Row className="g-5">
            <Col md={6}>
              <p className="eyebrow">Features</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>What you get</h3>
              <CheckList items={solution.features} cols={1} />
            </Col>
            <Col md={6}>
              <p className="eyebrow">Benefits</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Why it matters</h3>
              <CheckList items={solution.benefits} cols={1} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Technologies / Tools */}
      <section className="page-section" style={{ background: 'var(--eduact-soft2)' }}>
        <Container>
          <SectionTitle eyebrow="Toolkit" title="Technologies & tools" />
          <ChipList items={solution.techniques} />
        </Container>
      </section>

      {/* Process / Methodology */}
      <section className="page-section">
        <Container>
          <SectionTitle
            eyebrow="How we work"
            title="Our process"
            desc="A clear, practical process from first conversation to measurable results."
          />
          <Row className="g-4">
            {solution.process.map((mod, i) => (
              <Col md={6} lg={3} key={mod.title}>
                <div className="eduact-card reveal" style={{ height: '100%' }}>
                  <span className="idx">Step {String(i + 1).padStart(2, '0')}</span>
                  <h4>{mod.title}</h4>
                  <ul style={{ paddingLeft: '18px', margin: 0, listStyle: 'disc' }}>
                    {mod.items.map((item) => (
                      <li key={item} style={{ fontSize: '13.5px', color: 'var(--eduact-text)', marginBottom: '5px' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Use cases + Industries */}
      <section className="page-section" style={{ background: 'var(--eduact-soft2)' }}>
        <Container>
          <Row className="g-5">
            <Col md={6}>
              <p className="eyebrow">Where it applies</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Common use cases</h3>
              <CheckList items={solution.useCases} cols={1} />
            </Col>
            <Col md={6}>
              <p className="eyebrow">Industries</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Industries we serve</h3>
              <CheckList items={solution.industries} cols={1} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Audience + Why choose */}
      <section className="page-section">
        <Container>
          <Row className="g-5">
            <Col md={6}>
              <p className="eyebrow">Who it is for</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Who we work with</h3>
              <CheckList items={solution.audience} cols={1} />
            </Col>
            <Col md={6}>
              <p className="eyebrow">Why us</p>
              <h3 style={{ fontSize: '24px', color: 'var(--eduact-black)', marginBottom: '18px' }}>Why choose this solution</h3>
              <CheckList items={solution.whyChoose} cols={1} />
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ */}
      <section className="page-section" style={{ background: 'var(--eduact-soft2)' }}>
        <Container style={{ maxWidth: '860px' }}>
          <SectionTitle eyebrow="FAQ" title="Frequently asked questions" />
          <Accordion defaultActiveKey="0" style={{ borderRadius: '14px', overflow: 'hidden' }}>
            {solution.faq.map((f, i) => (
              <Accordion.Item eventKey={String(i)} key={f.q}>
                <Accordion.Header>{f.q}</Accordion.Header>
                <Accordion.Body style={{ fontSize: '14.5px', color: 'var(--eduact-text)' }}>
                  {f.a}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* Other solutions */}
      {otherSolutions && otherSolutions.length > 0 && (
        <section className="page-section">
          <Container>
            <SectionTitle eyebrow="Explore more" title="Other business solutions" />
            <Row className="g-4">
              {otherSolutions.map((s) => (
                <Col md={6} lg={4} key={s.slug}>
                  <div className="eduact-card reveal" style={{ height: '100%' }}>
                    <h4>{s.pageName}</h4>
                    <p>{s.shortDescription}</p>
                    <Link to={`/business-solutions/${s.slug}`} className="card-link">View solution →</Link>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="page-section" style={{ background: 'var(--eduact-base)' }}>
        <Container className="text-center">
          <h2 style={{ fontFamily: 'var(--heading-font)', fontWeight: 800, color: '#fff', fontSize: 'clamp(24px, 3vw, 34px)' }}>
            Ready to get started with {solution.pageName}?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '520px', margin: '14px auto 26px' }}>
            Talk to our team about how we can help. Call {COMPANY.primaryPhone} or send an enquiry.
          </p>
          <Link to="/contact" className="btn-eduact" style={{ background: 'var(--eduact-secondary)', color: 'var(--eduact-black)' }}>
            Get in Touch
          </Link>
        </Container>
      </section>
    </>
  );
}
