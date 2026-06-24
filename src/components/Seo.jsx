import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSiteContent } from '../context/useSiteContent';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_IMAGE,
  TWITTER_HANDLE,
  GA4_ID,
  GSC_VERIFICATION,
  seoConfig,
} from '../data/seoConfig';

function getPageKey(pathname) {
  if (pathname === '/') return 'home';
  const key = pathname.replace(/^\//, '').split('/')[0];
  return key || 'home';
}

export default function Seo() {
  const location = useLocation();
  const { siteContent } = useSiteContent();

  const pageKey = getPageKey(location.pathname);
  const config = seoConfig[pageKey] || seoConfig.home;
  const canonical = `${SITE_URL}${location.pathname === '/' ? '' : location.pathname}`;
  const ogImage = DEFAULT_IMAGE;

  // Derive title & description from CMS content as override where available
  const page = siteContent.pages?.[pageKey];
  const hero = page?.sections?.[0] || {};
  const brandName = siteContent.brand?.siteName || SITE_NAME;

  const title = config.title;
  const description =
    config.description ||
    hero.body ||
    siteContent.brand?.positioning ||
    `${brandName} — professional home of Sasidhar Valluru.`;

  const isNoIndex = config.noIndex || false;
  const isAdmin = location.pathname.startsWith('/admin');
  const hasGa4 = GA4_ID && GA4_ID !== 'G-XXXXXXXXXX' && !isAdmin;

  return (
    <Helmet prioritizeSeoTags>
      {/* ── Primary ──────────────────────────────────────────── */}
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {config.keywords && <meta name="keywords" content={config.keywords} />}
      <meta name="author" content="Sasidhar Valluru" />
      <meta name="robots" content={isNoIndex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      <link rel="canonical" href={canonical} />

      {/* ── Google Search Console verification ──────────────── */}
      {GSC_VERIFICATION && GSC_VERIFICATION !== 'YOUR_SEARCH_CONSOLE_VERIFICATION_CODE' && (
        <meta name="google-site-verification" content={GSC_VERIFICATION} />
      )}

      {hasGa4 && <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />}
      {hasGa4 && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}');
          `}
        </script>
      )}

      {/* ── Open Graph ───────────────────────────────────────── */}
      <meta property="og:site_name" content={brandName} />
      <meta property="og:type" content={config.ogType || 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:image:alt" content="SV favicon logo for TheValluru.com" />
      <meta property="og:locale" content="en_US" />

      {/* ── Twitter / X Cards ────────────────────────────────── */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="SV favicon logo for TheValluru.com" />
    </Helmet>
  );
}
