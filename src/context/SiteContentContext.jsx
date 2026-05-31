import { useEffect, useMemo, useState } from 'react';
import { SiteContentContext } from './SiteContentContextValue';
import { defaultSiteContent } from '../data/content';
import { getSiteContent, getTheme } from '../data/cms';

function applyTheme(theme) {
  const variableMap = {
    deepNavy: '--deep-navy',
    midNavy: '--mid-navy',
    gold: '--gold',
    warmWhite: '--warm-white',
    surfaceGrey: '--surface-grey',
    mutedBlue: '--muted-blue',
  };

  const designMaps = {
    sectionSpacing: {
      compact: '3.5rem',
      normal: '5rem',
      spacious: '7rem',
    },
    cardStyle: {
      flat: '0 1px 2px rgb(15 23 42 / 0.06)',
      elevated: '0 18px 38px rgb(15 23 42 / 0.1)',
      premium: '0 28px 70px rgb(15 23 42 / 0.16)',
    },
    cornerRadius: {
      sharp: '0.375rem',
      soft: '0.75rem',
      rounded: '1.25rem',
    },
    logoSize: {
      small: '3rem',
      medium: '4rem',
      large: '5rem',
    },
    animationIntensity: {
      calm: '14px',
      normal: '28px',
      expressive: '42px',
    },
    heroMediaOpacity: {
      quiet: '0.12',
      subtle: '0.2',
      visible: '0.32',
    },
    heroOverlay: {
      medium: '0.72',
      strong: '0.84',
      heavy: '0.9',
    },
    fontScale: {
      compact: '0.94',
      normal: '1',
      large: '1.06',
    },
  };

  Object.entries(variableMap).forEach(([key, variable]) => {
    if (theme[key]) {
      document.documentElement.style.setProperty(variable, theme[key]);
    }
  });

  const design = theme.design || {};
  document.documentElement.style.setProperty('--section-spacing', designMaps.sectionSpacing[design.sectionSpacing] || designMaps.sectionSpacing.normal);
  document.documentElement.style.setProperty('--card-shadow', designMaps.cardStyle[design.cardStyle] || designMaps.cardStyle.elevated);
  document.documentElement.style.setProperty('--corner-radius', designMaps.cornerRadius[design.cornerRadius] || designMaps.cornerRadius.soft);
  document.documentElement.style.setProperty('--logo-size', designMaps.logoSize[design.logoSize] || designMaps.logoSize.medium);
  document.documentElement.style.setProperty('--reveal-distance', designMaps.animationIntensity[design.animationIntensity] || designMaps.animationIntensity.normal);
  document.documentElement.style.setProperty('--hero-media-opacity', designMaps.heroMediaOpacity[design.heroMediaOpacity] || designMaps.heroMediaOpacity.subtle);
  document.documentElement.style.setProperty('--hero-overlay-opacity', designMaps.heroOverlay[design.heroOverlay] || designMaps.heroOverlay.strong);
  document.documentElement.style.setProperty('--font-scale', designMaps.fontScale[design.fontScale] || designMaps.fontScale.normal);
}

export function SiteContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(() => getSiteContent(defaultSiteContent));
  const [theme, setTheme] = useState(() => getTheme());
  const [source, setSource] = useState('local');

  useEffect(() => {
    function handleStorage() {
      setSiteContent(getSiteContent(defaultSiteContent));
      setTheme(getTheme());
      setSource('local');
    }

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      siteContent,
      theme,
      isLoading: false,
      source,
    }),
    [siteContent, theme, source],
  );

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}
