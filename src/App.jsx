import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { SiteContentProvider } from './context/SiteContentContext';
import Home from './pages/Home';
import About from './pages/About';
import Investments from './pages/Investments';
import Advisory from './pages/Advisory';
import Insights from './pages/Insights';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <Router>
      <SiteContentProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SiteContentProvider>
    </Router>
  );
}

export default App;
