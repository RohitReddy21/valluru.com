import { useEffect, useMemo, useState } from 'react';
import { SiteContentContext } from './SiteContentContextValue';
import { defaultSiteContent } from '../data/content';
import { getSiteContent, getTheme, normalizeTheme, saveSiteContent, saveTheme } from '../data/cms';
import { loadLiveCms } from '../data/liveCms';

function applyTheme(theme) {
  const variableMap = {
    deepNavy: '--deep-navy',
    midNavy: '--mid-navy',
    gold: '--gold',
    warmWhite: '--warm-white',
    surfaceGrey: '--surface-grey',
    mutedBlue: '--muted-blue',
    accentCopper: '--accent-copper',
  };

  const designMaps = {
    sectionSpacing: {
      compact: '3.5rem',
      normal: '6rem',
      spacious: '7.5rem',
    },
    cardStyle: {
      flat: '0 1px 2px rgb(29 34 38 / 0.08)',
      elevated: '0 16px 34px rgb(29 34 38 / 0.1)',
      premium: '0 26px 62px rgb(29 34 38 / 0.16)',
    },
    cornerRadius: {
      sharp: '0.375rem',
      soft: '0.75rem',
      rounded: '1.25rem',
    },
    logoSize: {
      small: '5.25rem',
      medium: '6.5rem',
      large: '8rem',
    },
    animationIntensity: {
      calm: '14px',
      normal: '28px',
      expressive: '42px',
    },
    heroMediaOpacity: {
      quiet: '0.28',
      subtle: '0.42',
      visible: '0.58',
    },
    heroOverlay: {
      medium: '0.48',
      strong: '0.62',
      heavy: '0.74',
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
    let cancelled = false;

    async function loadLiveContent() {
      const liveState = await loadLiveCms();
      if (cancelled || !liveState) return;

      if (liveState.content) {
        setSiteContent(liveState.content);
        saveSiteContent(liveState.content);
      }

      if (liveState.theme) {
        const normalizedTheme = normalizeTheme(liveState.theme);
        setTheme(normalizedTheme);
        saveTheme(normalizedTheme);
      }

      setSource('live');
    }

    function handleStorage() {
      setSiteContent(getSiteContent(defaultSiteContent));
      setTheme(getTheme());
      setSource('local');
    }

    loadLiveContent();
    window.addEventListener('storage', handleStorage);

    return () => {
      cancelled = true;
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
