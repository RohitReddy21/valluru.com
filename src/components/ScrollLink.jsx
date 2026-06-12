import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollLink({ href, to, children, ...props }) {
  const location = useLocation();
  const hrefValue = href || to;

  const handleClick = (e) => {
    e.preventDefault();

    if (!hrefValue) return;

    // Extract the hash from the href
    const hashIndex = hrefValue.indexOf('#');
    if (hashIndex === -1) {
      window.location.href = hrefValue;
      return;
    }

    const hash = hrefValue.substring(hashIndex + 1);
    const path = hrefValue.substring(0, hashIndex) || location.pathname;

    // If we need to navigate to a different page, use window.location to preserve hash
    if (path !== location.pathname) {
      window.location.href = hrefValue;
      return;
    }

    // Same page: just scroll
    scrollToHash(hash);
  };

  return (
    <a href={hrefValue} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

// Helper function to scroll to element by hash
function scrollToHash(hash) {
  const scrollToElement = () => {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Ensure DOM is ready
  setTimeout(scrollToElement, 200);
}

// Global hook to handle hash navigation on page load
export function useScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToHash(hash);
    }
  }, []);
}

export default ScrollLink;
