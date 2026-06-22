import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { SITE_URL, SITE_NAME, PERSON_NAME, LINKEDIN_URL, LOGO_URL, breadcrumbMap } from '../data/seoConfig';

/**
 * JSON-LD Structured Data component.
 * Injects Organization, Website, Person, and Breadcrumb schemas.
 * FAQ schema is injected on specific pages where content warrants it.
 */
export default function SchemaMarkup() {
  const location = useLocation();
  const pathname = location.pathname;
  const breadcrumbs = breadcrumbMap[pathname];

  // ── Organization Schema ─────────────────────────────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 200,
      height: 200,
    },
    sameAs: [
      LINKEDIN_URL,
      'https://thevalluru.org/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'business inquiries',
      url: `${SITE_URL}/contact`,
      availableLanguage: 'English',
    },
  };

  // ── Website Schema ──────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
  };

  // ── Person Schema ───────────────────────────────────────
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: PERSON_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/pic1.jpeg`,
    jobTitle: 'Investor, Operator & AI Architect',
    description:
      'Sasidhar Valluru is an investor, operator, and AI architect who builds, backs, and scales companies at the intersection of applied AI, product architecture, delivery governance, and India execution.',
    sameAs: [
      LINKEDIN_URL,
      'https://thevalluru.org/',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'TechJignayasa',
      url: 'https://techjignyasa.com',
    },
    knowsAbout: [
      'Applied AI',
      'Product Architecture',
      'Delivery Governance',
      'India Execution',
      'Venture Building',
      'Executive Advisory',
      'Operating Model Design',
      'PMO',
    ],
  };

  // ── Breadcrumb Schema ───────────────────────────────────
  const breadcrumbSchema = breadcrumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.label,
          item: crumb.href ? `${SITE_URL}${crumb.href}` : undefined,
        })),
      }
    : null;

  // ── FAQ Schema (Advisory page) ──────────────────────────
  const advisoryFaqSchema =
    pathname === '/advisory'
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What kind of advisory work does Sasidhar Valluru do?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Sasidhar Valluru provides executive advisory across AI architecture, product and platform design, PMO and delivery governance, India ODC/BOT execution, and operational transformation. Engagements range from decision support to full operating model design.',
              },
            },
            {
              '@type': 'Question',
              name: 'Who does Sasidhar Valluru work with?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'He works with founders, CTOs, product leaders, investors, and enterprise teams when the problem requires strategic judgment and execution detail.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is the output of an advisory engagement?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Every lane produces a useful output: decision memos, operating models, architecture reviews, governance plans, PMO frameworks, AI deployment blueprints, or India execution models.',
              },
            },
            {
              '@type': 'Question',
              name: 'How can I start an advisory conversation?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use the Contact page at www.thevalluru.com/contact to start a serious advisory, investment, partnership, or operating conversation.',
              },
            },
          ],
        }
      : null;

  // ── Investments FAQ Schema ──────────────────────────────
  const investmentsFaqSchema =
    pathname === '/__hidden-investments'
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What kind of companies does Sasidhar Valluru invest in?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'He invests in operating companies where technology, workflow, data, and execution create durable advantage — including Applied AI, vertical AI, energy management, India ODC/BOT models, and enterprise workflow automation.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is his current investment portfolio?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Current portfolio includes TechJignayasa (AI adoption and platform engineering), PrimeVerse (venture and investment platform), and Vipas Energy (energy and utility management).',
              },
            },
          ],
        }
      : null;

  const schemas = [
    organizationSchema,
    websiteSchema,
    personSchema,
    breadcrumbSchema,
    advisoryFaqSchema,
    investmentsFaqSchema,
  ].filter(Boolean);

  return (
    <Helmet>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
