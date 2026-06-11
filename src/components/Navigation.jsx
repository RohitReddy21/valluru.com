import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

export default function Navigation() {
  const { siteContent } = useSiteContent();
  const { brand } = siteContent;
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Expertise', href: '/advisory' },
    { label: 'Investments', href: '/investments' },
    { label: 'Insights', href: '/insights' },
  ];

  const linkClass = ({ isActive }) => (
    `nav-link rounded-none px-1 py-2 text-sm font-semibold transition ${
      isActive
        ? 'text-[var(--gold)]'
        : 'text-[var(--deep-navy)] hover:text-[var(--gold)]'
    }`
  );

  return (
    <nav className="site-nav sticky top-0 z-50 border-b border-[var(--surface-grey)] bg-white/92 backdrop-blur-xl">
      <div className="container-custom">
        <div className="flex min-h-16 items-center justify-between gap-6 sm:min-h-[5.25rem]">
          <Link to="/" className="brand-lockup min-w-10" onClick={() => setIsOpen(false)} aria-label={brand.personName}>
            <span className="brand-monogram w-15">SV</span>
            <span className="brand-name font-extrabold">{brand.personName}</span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link to="/contact" className="nav-cta hidden lg:inline-flex">
            Contact Me <span aria-hidden="true">-&gt;</span>
          </Link>

          <button
            type="button"
            className="group inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--surface-grey)] bg-white text-[var(--deep-navy)] shadow-sm transition hover:border-[var(--gold)] hover:text-[var(--gold)] lg:hidden"
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
          <div className="nav-mobile-panel grid gap-1 border-t border-[var(--surface-grey)] bg-white py-4 lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={linkClass}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/contact" className="nav-cta mt-3 w-full" onClick={() => setIsOpen(false)}>
              Contact Me <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
