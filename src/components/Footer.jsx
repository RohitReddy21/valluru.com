import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

export default function Footer() {
  const { siteContent } = useSiteContent();
  const { brand } = siteContent;

  return (
    <footer className="border-t border-[var(--mid-navy)] bg-[var(--deep-navy)] py-14 text-white">
      <div className="container-custom">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{brand.siteName}</h3>
            <p className="max-w-sm leading-7 text-[var(--warm-white)]">{brand.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[var(--gold)]">Quick Links</h4>
            <ul className="space-y-2 text-[var(--warm-white)]">
              <li><Link to="/" className="transition hover:text-[var(--gold)]">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-[var(--gold)]">About</Link></li>
              {/* <li><Link to="/investments" className="transition hover:text-[var(--gold)]">Investments</Link></li> */}
              <li><Link to="/advisory" className="transition hover:text-[var(--gold)]">Advisory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[var(--gold)]">Resources</h4>
            <ul className="space-y-2 text-[var(--warm-white)]">
              {/* <li><Link to="/insights" className="transition hover:text-[var(--gold)]">Insights</Link></li> */}
              <li><a href={brand.linkedinUrl} target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">LinkedIn</a></li>
              <li><a href="https://www.thevalluru.org/" target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">The Human Side</a></li>
              <li><Link to="/contact#contact-form" className="transition hover:text-[var(--gold)]">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--mid-navy)] pt-8 md:flex-row">
          <p className="text-sm text-[var(--warm-white)]">{brand.footerLine}</p>
          <p className="text-xs text-[var(--surface-grey)] md:text-right">{brand.secondaryFooterLine}</p>
        </div>
      </div>
    </footer>
  );
}
