/**
 * Centralized SEO configuration for TheValluru.com
 * Update titles, descriptions, and keywords per page here.
 */

export const SITE_URL = 'https://thevalluru.com';
export const SITE_NAME = 'TheValluru.com';
export const PERSON_NAME = 'Sasidhar Valluru';
export const DEFAULT_IMAGE = `${SITE_URL}/hero-tech-bg.png`;
export const TWITTER_HANDLE = '@sasivalluru';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/sasivalluru/';
export const LOGO_URL = `${SITE_URL}/favicon.svg`;

// GA4 Measurement ID for TheValluru.com
export const GA4_ID = 'G-8TBRZSRX6G';

// Google Search Console verification code — replace with your real code
export const GSC_VERIFICATION = 'YOUR_SEARCH_CONSOLE_VERIFICATION_CODE';

export const seoConfig = {
  home: {
    title: 'Sasidhar Valluru — Investor, Operator & AI Architect | TheValluru.com',
    description:
      'Sasidhar Valluru is an investor, operator, and AI architect who builds, backs, and scales companies at the intersection of applied AI, product architecture, delivery governance, and India execution.',
    keywords:
      'Sasidhar Valluru, investor, AI architect, operator, executive builder, applied AI, India execution, product architecture, delivery governance',
    ogType: 'website',
  },
  about: {
    title: 'About Sasidhar Valluru — Executive Builder, Operator & AI Leader',
    description:
      'Learn about Sasidhar Valluru — an executive builder with deep experience in AI-enabled systems, enterprise platforms, BPO operations, offshore execution, venture building, and leadership formation.',
    keywords:
      'about Sasidhar Valluru, executive background, AI leader, platform engineering, BPO operations, India delivery, venture builder, leadership',
    ogType: 'profile',
  },
  investments: {
    title: 'Investments — Sasidhar Valluru | TechJignayasa, PrimeVerse, Vipas Energy',
    description:
      'Sasidhar Valluru invests in and builds operating companies where technology, workflow, data, and execution create durable advantage. Portfolio includes TechJignayasa, PrimeVerse, and Vipas Energy.',
    keywords:
      'Sasidhar Valluru investments, TechJignayasa, PrimeVerse, Vipas Energy, applied AI investment, venture building, India execution, AI operating leverage',
    ogType: 'website',
  },
  advisory: {
    title: 'Executive Advisory — Sasidhar Valluru | AI, Product, PMO & India Execution',
    description:
      'Sasidhar Valluru provides executive advisory for AI architecture, product and platform design, PMO and delivery governance, India ODC/BOT execution, and operational transformation.',
    keywords:
      'executive advisory, AI advisory, product architecture advisory, PMO governance, India ODC BOT, offshore execution advisory, operational transformation, Sasidhar Valluru',
    ogType: 'website',
  },
  insights: {
    title: 'Insights — AI Operations, Product Architecture & Delivery Governance | Sasidhar Valluru',
    description:
      'Public notes by Sasidhar Valluru on AI operations, product architecture, delivery governance, India execution, venture building, and leadership. Essays on making technology operationally useful.',
    keywords:
      'AI operations insights, product architecture essays, delivery governance notes, India execution, venture building, leadership essays, Sasidhar Valluru blog',
    ogType: 'website',
  },
  contact: {
    title: 'Contact Sasidhar Valluru — Start an Advisory or Investment Conversation',
    description:
      'Start a serious advisory, investment, partnership, or operating conversation with Sasidhar Valluru. Engagements cover AI architecture, product delivery, PMO, India execution, and venture building.',
    keywords:
      'contact Sasidhar Valluru, advisory inquiry, investment conversation, AI advisory contact, executive advisory India, startup advisory',
    ogType: 'website',
  },
  admin: {
    title: 'Admin | TheValluru.com',
    description: 'Site administration — not indexed.',
    keywords: '',
    ogType: 'website',
    noIndex: true,
  },
  notFound: {
    title: '404 — Page Not Found | TheValluru.com',
    description: 'The page you are looking for does not exist. Return to TheValluru.com.',
    keywords: '',
    ogType: 'website',
    noIndex: true,
  },
};

/**
 * Breadcrumb data per route
 */
export const breadcrumbMap = {
  '/about': [{ label: 'Home', href: '/' }, { label: 'About' }],
  '/investments': [{ label: 'Home', href: '/' }, { label: 'Investments' }],
  '/advisory': [{ label: 'Home', href: '/' }, { label: 'Advisory' }],
  '/insights': [{ label: 'Home', href: '/' }, { label: 'Insights' }],
  '/contact': [{ label: 'Home', href: '/' }, { label: 'Contact' }],
};
