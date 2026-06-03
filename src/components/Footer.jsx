import { Link } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

export default function Footer() {
  const { siteContent } = useSiteContent();
  const { brand } = siteContent;

  return (
    <footer className="border-t border-[#4A3F35] bg-[#2C2C2C] py-12 text-white">
      <div className="container-custom">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">{brand.siteName}</h3>
            <p className="text-[#F5F4F0]">{brand.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#B08D57]">Navigation</h4>
            <ul className="space-y-2 text-[#F5F4F0]">
              <li><Link to="/" className="transition hover:text-[#B08D57]">Home</Link></li>
              <li><Link to="/about" className="transition hover:text-[#B08D57]">About</Link></li>
              <li><Link to="/investments" className="transition hover:text-[#B08D57]">Investments</Link></li>
              <li><Link to="/advisory" className="transition hover:text-[#B08D57]">Advisory</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-[#B08D57]">Resources</h4>
            <ul className="space-y-2 text-[#F5F4F0]">
              <li><Link to="/insights" className="transition hover:text-[#B08D57]">Insights</Link></li>
              <li><a href={brand.linkedinUrl} target="_blank" rel="noreferrer" className="transition hover:text-[#B08D57]">LinkedIn</a></li>
              <li><a href={brand.inwardFireUrl} className="transition hover:text-[#B08D57]">TheValluru.org</a></li>
              <li><Link to="/contact" className="transition hover:text-[#B08D57]">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#4A3F35] pt-8 md:flex-row">
          <p className="text-sm text-[#F5F4F0]">{brand.footerLine}</p>
          <p className="text-xs text-[#6B7A99] md:text-right">{brand.secondaryFooterLine}</p>
        </div>
      </div>
    </footer>
  );
}
