import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { siteContent } from '../data/content';

export default function Navigation() {
  const { brand, nav } = siteContent;
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }) => (
    `rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-white text-blue-950'
        : 'text-blue-100 hover:bg-blue-900 hover:text-yellow-200'
    }`
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-900 bg-blue-950/95 backdrop-blur">
      <div className="container-custom">
        <div className="flex min-h-20 items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-white sm:text-2xl" onClick={() => setIsOpen(false)}>
            {brand.siteName}
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link to="/contact" className="btn-warm hidden lg:inline-flex">
            Working Conversation
          </Link>

          <button
            type="button"
            className="group inline-flex h-10 w-10 items-center justify-center rounded-md border border-blue-800 text-blue-100 transition hover:border-yellow-200 hover:text-yellow-200 lg:hidden"
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
          <div className="grid gap-2 border-t border-blue-900 py-4 lg:hidden">
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
