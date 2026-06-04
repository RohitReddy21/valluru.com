import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Seo from './components/Seo';
import { SiteContentProvider } from './context/SiteContentContext';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Investments = lazy(() => import('./pages/Investments'));
const Advisory = lazy(() => import('./pages/Advisory'));
const Insights = lazy(() => import('./pages/Insights'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <span className="route-fallback-mark" aria-hidden="true"></span>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <SiteContentProvider>
        <Seo />
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/advisory" element={<Advisory />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </SiteContentProvider>
    </Router>
  );
}

export default App;
