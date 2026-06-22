/**
 * Centralized SEO configuration for TheValluru.com
 * Update titles, descriptions, and keywords per page here.
 */

export const SITE_URL = 'https://www.thevalluru.com';
export const SITE_NAME = 'TheValluru.com';
export const PERSON_NAME = 'Sasidhar Valluru';
export const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;
export const TWITTER_HANDLE = '@sasivalluru';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/sasivalluru/';
export const LOGO_URL = `${SITE_URL}/favicon.svg`;

// GA4 Measurement ID for TheValluru.com
export const GA4_ID = 'G-8TBRZSRX6G';

// Google Search Console verification code — replace with your real code
export const GSC_VERIFICATION = 'YOUR_SEARCH_CONSOLE_VERIFICATION_CODE';

export const seoConfig = {
  home: {
    title: 'Sasidhar Valluru - Investor, Operator, AI Architect, Executive Builder',
    description:
      'Professional home of Sasidhar Valluru. Applied AI, product architecture, operating model design, India execution, enterprise workflows, and delivery governance.',
    keywords:
      'Sasidhar Valluru, investor, AI architect, operator, executive builder, applied AI, India execution, product architecture, delivery governance',
    ogType: 'website',
  },
  about: {
    title: 'About Sasidhar Valluru - Builder, Operator, AI Architect',
    description:
      'Professional identity, working method, builder/operator background, leadership philosophy, and operating approach of Sasidhar Valluru.',
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
    noIndex: true,
  },
  advisory: {
    title: 'Executive Advisory - Applied AI, Product Architecture, PMO, ODC/BOT Execution',
    description:
      'Advisory for founders, CTOs, investors, product leaders, and enterprise teams facing AI, product, delivery, governance, and operating-model problems.',
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
    noIndex: true,
  },
  contact: {
    title: 'Start a Working Conversation - Sasidhar Valluru',
    description:
      'Contact Sasidhar Valluru for executive advisory, applied AI systems, product architecture, India execution, operating model design, and venture conversations.',
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
