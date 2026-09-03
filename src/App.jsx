import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import NavigationBar from './components/Navbar';
import Footer from './components/Footer';
import ClickSpark from './components/ClickSpark';
import AdminRoutes from './admin/AdminRoutes';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './context/ToastContext';
import NetworkStatus from './components/NetworkStatus';
import CookieConsent from './components/CookieConsent';
import { Shimmer } from './components/ui/States';
import { trackPageView } from './utils/analytics';
import { installGlobalHandlers } from './utils/crashReporter';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const BusinessSolutions = lazy(() => import('./pages/BusinessSolutions'));
const BusinessSolutionDetail = lazy(() => import('./pages/business/BusinessSolutionDetail'));
const LearningPrograms = lazy(() => import('./pages/LearningPrograms'));
const CourseDetailPage = lazy(() => import('./pages/learning/CourseDetailPage'));
const CSRProjects = lazy(() => import('./pages/CSRProjects'));
const MOUDirectory = lazy(() => import('./pages/MOUDirectory'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageWrapper({ children }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return <div className="page-wrapper" key={pathname}>{children}</div>;
}

function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    installGlobalHandlers();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const toTop = document.getElementById('to-top');
    const onScroll = () => {
      if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    const observe = () => {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
    };
    observe();

    // Re-observe after route changes
    const observer = new MutationObserver(observe);
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
      observer.disconnect();
    };
  }, []);

  if (isAdmin) {
    return <AdminRoutes />;
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ClickSpark
          sparkColor="#e4cc2e"
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={450}
          easing="ease-out"
        >
          <NetworkStatus />
          <NavigationBar />
            <Suspense
              fallback={
                <Shimmer />
              }
            >
            <Routes>
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/business-solutions" element={<PageWrapper><BusinessSolutions /></PageWrapper>} />
              <Route path="/business-solutions/:slug" element={<PageWrapper><BusinessSolutionDetail /></PageWrapper>} />
              <Route path="/learning-programs" element={<PageWrapper><LearningPrograms /></PageWrapper>} />
              <Route path="/learning-programs/:slug" element={<PageWrapper><CourseDetailPage /></PageWrapper>} />
              <Route path="/csr-projects" element={<PageWrapper><CSRProjects /></PageWrapper>} />
              <Route path="/mou-directory" element={<PageWrapper><MOUDirectory /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
              <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
              <Route path="/sitemap" element={<PageWrapper><SitemapPage /></PageWrapper>} />
              <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
            </Routes>
          </Suspense>
          <Footer />
          <button
            id="to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
          >
            ↑
          </button>
        </ClickSpark>
        <CookieConsent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
