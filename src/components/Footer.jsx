import { Link } from 'react-router-dom';
import { siteContent } from '../data/content';

export default function Footer() {
  const { brand } = siteContent;

  return (
    <footer className="border-t border-blue-900 bg-blue-950 py-12 text-white">
      <div className="container-custom">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{brand.siteName}</h3>
            <p className="text-blue-100">{brand.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-yellow-200">Navigation</h4>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/" className="transition hover:text-yellow-200">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-yellow-200">About</Link></li>
              <li><Link to="/investments" className="transition hover:text-yellow-200">Investments</Link></li>
              <li><Link to="/advisory" className="transition hover:text-yellow-200">Advisory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-yellow-200">Resources</h4>
            <ul className="space-y-2 text-blue-100">
              <li><Link to="/insights" className="transition hover:text-yellow-200">Insights</Link></li>
              <li><a href={brand.linkedinUrl} target="_blank" rel="noreferrer" className="transition hover:text-yellow-200">LinkedIn</a></li>
              <li><a href={brand.inwardFireUrl} className="transition hover:text-yellow-200">TheValluru.org</a></li>
              <li><Link to="/contact" className="transition hover:text-yellow-200">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-blue-800 pt-8 md:flex-row">
          <p className="text-sm text-blue-100">{brand.footerLine}</p>
          <p className="text-xs text-blue-200 md:text-right">{brand.secondaryFooterLine}</p>
        </div>
      </div>
    </footer>
  );
}
