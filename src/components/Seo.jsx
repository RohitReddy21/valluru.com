import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';

const siteUrl = 'https://valluru-com.vercel.app';

function setMeta(name, content, attribute = 'name') {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function getPageKey(pathname) {
  if (pathname === '/') return 'home';
  return pathname.replace('/', '') || 'home';
}

export default function Seo() {
  const location = useLocation();
  const { siteContent } = useSiteContent();

  useEffect(() => {
    const pageKey = getPageKey(location.pathname);
    const page = siteContent.pages?.[pageKey] || siteContent.pages?.home;
    const hero = page?.sections?.[0] || {};
    const brandName = siteContent.brand?.siteName || 'TheValluru.com';
    const personName = siteContent.brand?.personName || 'Sasidhar Valluru';
    const title = pageKey === 'admin'
      ? `Admin | ${brandName}`
      : pageKey === 'home'
      ? `${brandName} | ${siteContent.brand?.tagline || 'Investor. Operator. AI Architect.'}`
      : `${page?.title || pageKey} | ${brandName}`;
    const description = hero.body || siteContent.brand?.positioning || `${personName} professional home.`;
    const canonical = `${siteUrl}${location.pathname}`;
    const image = `${siteUrl}/hero-tech-bg.png`;

    document.title = title;
    setMeta('description', description);
    setMeta('robots', pageKey === 'admin' ? 'noindex,nofollow' : 'index,follow');
    setMeta('og:type', 'website', 'property');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:image', image, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
    setLink('canonical', canonical);
  }, [location.pathname, siteContent]);

  return null;
}
