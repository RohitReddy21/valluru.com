import { createContext } from 'react';
import { defaultSiteContent } from '../data/content';
import { defaultTheme } from '../data/cms';

export const SiteContentContext = createContext({
  siteContent: defaultSiteContent,
  theme: defaultTheme,
  isLoading: false,
  source: 'fallback',
});
