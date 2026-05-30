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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-blue-800 text-blue-100 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((value) => !value)}
          >
            <span className="text-sm font-semibold">{isOpen ? 'Close' : 'Menu'}</span>
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
