export const defaultTheme = {
  deepNavy: '#1D2226',
  midNavy: '#38434F',
  gold: '#0A66C2',
  warmWhite: '#F3F2EF',
  surfaceGrey: '#D6CEC2',
  mutedBlue: '#5E6B75',
  accentCopper: '#004182',
  design: {
    sectionSpacing: 'normal',
    cardStyle: 'elevated',
    cornerRadius: 'soft',
    logoSize: 'large',
    animationIntensity: 'normal',
    heroMediaOpacity: 'visible',
    heroOverlay: 'medium',
    fontScale: 'normal',
  },
};

const contentKey = 'thevalluru:content';
const themeKey = 'thevalluru:theme';
const adminKey = 'thevalluru:admin';
const adminPasswordKey = 'thevalluru:admin-password';
const oldDefaultPalette = {
  deepNavy: '#0B1120',
  midNavy: '#1A2E52',
  gold: '#C9A84C',
  warmWhite: '#F5F4F0',
  surfaceGrey: '#E8E6E0',
  mutedBlue: '#6B7A99',
};

const warmDefaultPalette = {
  deepNavy: '#2C2C2C',
  midNavy: '#4A3F35',
  gold: '#B08D57',
  warmWhite: '#F8F4EC',
  surfaceGrey: '#E8DDCB',
  mutedBlue: '#4A3F35',
  accentCopper: '#A66A3F',
};

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage;
}

function canUseSessionStorage() {
  return typeof window !== 'undefined' && window.sessionStorage;
}

function readJson(key, fallback) {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getSiteContent(defaultContent) {
  const storedContent = readJson(contentKey, defaultContent);

  if (defaultContent?._version && storedContent?._version !== defaultContent._version) {
    return defaultContent;
  }

  return storedContent;
}

export function getTheme() {
  const storedTheme = normalizeTheme(readJson(themeKey, defaultTheme));
  return {
    ...defaultTheme,
    ...storedTheme,
    design: {
      ...defaultTheme.design,
      ...(storedTheme?.design || {}),
    },
  };
}

export function normalizeTheme(theme) {
  if (!theme) return defaultTheme;

  const paletteMatches = (palette) => Object.entries(palette).every(([key, value]) => (
    !theme[key] || String(theme[key]).toLowerCase() === value.toLowerCase()
  ));

  if (!paletteMatches(oldDefaultPalette) && !paletteMatches(warmDefaultPalette)) return theme;

  return {
    ...defaultTheme,
    design: {
      ...defaultTheme.design,
      ...(theme.design || {}),
    },
  };
}

export function saveSiteContent(content) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(contentKey, JSON.stringify(content));
}

export function saveTheme(theme) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(themeKey, JSON.stringify(theme));
}

export function resetCms() {
  window.localStorage.removeItem(contentKey);
  window.localStorage.removeItem(themeKey);
}

export function isAdminUnlocked() {
  return (
    canUseStorage() &&
    canUseSessionStorage() &&
    window.localStorage.getItem(adminKey) === 'true' &&
    Boolean(window.sessionStorage.getItem(adminPasswordKey))
  );
}

export function unlockAdmin(password) {
  if (canUseStorage() && canUseSessionStorage() && password.trim()) {
    window.localStorage.setItem(adminKey, 'true');
    window.sessionStorage.setItem(adminPasswordKey, password);
    return true;
  }

  return false;
}

export function lockAdmin() {
  if (!canUseStorage() || !canUseSessionStorage()) return;
  window.localStorage.removeItem(adminKey);
  window.sessionStorage.removeItem(adminPasswordKey);
}

export function getAdminPassword() {
  if (!canUseSessionStorage()) return '';
  return window.sessionStorage.getItem(adminPasswordKey) || '';
}
