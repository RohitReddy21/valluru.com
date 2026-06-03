import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

export default function Navigation() {
  const { siteContent } = useSiteContent();
  const { brand, nav } = siteContent;
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }) => (
    `nav-link rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-[#F5F4F0] text-[#2C2C2C]'
        : 'text-[#F5F4F0] hover:bg-[#4A3F35] hover:text-[#B08D57]'
    }`
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#4A3F35] bg-[#2C2C2C]/95 backdrop-blur">
      <div className="container-custom">
        <div className="flex min-h-16 items-center justify-between gap-4 sm:min-h-20">
          <Link to="/" className="min-w-0 text-lg font-bold text-white sm:text-2xl" onClick={() => setIsOpen(false)}>
            {brand.siteName}
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {nav.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link to="/contact" className="btn-warm hidden xl:inline-flex">
            Working Conversation
          </Link>

          <button
            type="button"
            className="group inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#4A3F35] text-[#F5F4F0] transition hover:border-[#B08D57] hover:text-[#B08D57] xl:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="sr-only">{isOpen ? 'Close navigation' : 'Open navigation'}</span>
            <span className="relative h-5 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-1 block h-0.5 w-5 rounded-full bg-current transition ${
                  isOpen ? 'translate-y-2 rotate-45' : ''
                }`}
              ></span>
              <span
                className={`absolute left-0 top-2.5 block h-0.5 w-5 rounded-full bg-current transition ${
                  isOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`absolute left-0 top-4 block h-0.5 w-5 rounded-full bg-current transition ${
                  isOpen ? '-translate-y-1.5 -rotate-45' : ''
                }`}
              ></span>
            </span>
          </button>
        </div>

        {isOpen && (
          <div className="nav-mobile-panel grid gap-2 border-t border-[#4A3F35] py-4 xl:hidden">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn-warm mt-2" onClick={() => setIsOpen(false)}>
              Working Conversation
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
