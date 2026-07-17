import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

export default function Footer() {
  const { siteContent } = useSiteContent();
  const { brand } = siteContent;

  return (
    <footer className="border-t border-[var(--mid-navy)] bg-[var(--deep-navy)] py-14 text-white">
      <div className="container-custom">
        <div className="flex justify-between gap-15 md:gap-24 flex-wrap mb-12">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{brand.siteName}</h3>
            <p className="max-w-sm leading-7 text-[var(--warm-white)]">{brand.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[var(--gold)]">Quick Links</h4>
            <ul className="space-y-2 text-[var(--warm-white)] list-disc list-inside">
              <li><Link to="/" className="transition hover:text-[var(--gold)]">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-[var(--gold)]">About</Link></li>
              <li><Link to="/advisory" className="transition hover:text-[var(--gold)]">Advisory</Link></li>
              <li><Link to="/contact#contact-form" className="transition hover:text-[var(--gold)]">Contact</Link></li>

            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[var(--gold)]">Resources</h4>
            <ul className="space-y-2 text-[var(--warm-white)] list-disc list-inside">
              <li><a href={brand.linkedinUrl} target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">LinkedIn Profile</a></li>
              <li><a href="https://safespaceglobal.ai/about/#leadership" target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">SafeSpace Global - Leadership Profile</a></li>
              <li><a href="https://www.globenewswire.com/news-release/2025/04/15/3062117/0/en/Healthcare-Integrated-Technologies-Inc-Appoints-Sasidhar-Valluru-as-Director-of-Global-Product-Delivery.html" target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">HITC Appointment Announcement</a></li>
              {/* <li><a href="https://www.prismicreflections.com/about-us" target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">Prismic Reflections - Product / Design Collaboration Quote</a></li> */}
              <li><a href={brand.inwardFireUrl} target="_blank" rel="noreferrer" className="transition hover:text-[var(--gold)]">TheValluru.org / The Human Side</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--mid-navy)] pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm text-[var(--warm-white)]">{brand.footerLine}</p>
          <div className="flex flex-col items-center gap-2 text-xs text-[var(--surface-grey)] md:items-end md:text-right">
            <p>{brand.secondaryFooterLine}</p>
            <a
              href="https://primeverse.in/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--warm-white)] transition hover:text-[var(--gold)]"
            >
              Powered by PrimeVerse.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
