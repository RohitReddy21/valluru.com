import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Helper function to scroll to element by hash
export function scrollToHash(hash) {
  if (!hash) return;

  const scrollToElement = () => {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`Element with id "${hash}" not found`);
    }
  };

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToElement);
  } else {
    setTimeout(scrollToElement, 100);
  }
}

function ScrollLink({ href, to, children, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hrefValue = href || to;

  const handleClick = (e) => {
    e.preventDefault();

    if (!hrefValue) return;

    // Extract the hash from the href
    const hashIndex = hrefValue.indexOf('#');
    if (hashIndex === -1) {
      // No hash, just navigate
      navigate(hrefValue);
      return;
    }

    const hash = hrefValue.substring(hashIndex + 1);
    const path = hrefValue.substring(0, hashIndex) || location.pathname;

    // If navigating to a different page
    if (path && path !== location.pathname) {
      // Navigate and let the hook handle scrolling
      navigate({ pathname: path, hash: `#${hash}` });
    } else {
      // Same page: just scroll
      scrollToHash(hash);
    }
  };

  return (
    <a href={hrefValue} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

// Global hook to handle hash navigation on page load and location changes
export function useScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const hash = location.hash.substring(1);
      scrollToHash(hash);
    }
  }, [location]);
}

export default ScrollLink;
