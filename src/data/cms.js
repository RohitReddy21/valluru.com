export const defaultTheme = {
  deepNavy: '#0B1120',
  midNavy: '#1A2E52',
  gold: '#C9A84C',
  warmWhite: '#F5F4F0',
  surfaceGrey: '#E8E6E0',
  mutedBlue: '#6B7A99',
  design: {
    sectionSpacing: 'normal',
    cardStyle: 'elevated',
    cornerRadius: 'soft',
    logoSize: 'medium',
    animationIntensity: 'normal',
    heroMediaOpacity: 'subtle',
    heroOverlay: 'strong',
    fontScale: 'normal',
  },
};

const contentKey = 'thevalluru:content';
const themeKey = 'thevalluru:theme';
const adminKey = 'thevalluru:admin';
const adminPasswordKey = 'thevalluru:admin-password';

function canUseStorage() {
  return typeof window !== 'undefined' && window.localStorage;
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
  const storedTheme = readJson(themeKey, defaultTheme);
  return {
    ...defaultTheme,
    ...storedTheme,
    design: {
      ...defaultTheme.design,
      ...(storedTheme?.design || {}),
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
  return canUseStorage() && window.localStorage.getItem(adminKey) === 'true';
}

export function unlockAdmin(password) {
  if (password.trim()) {
    window.localStorage.setItem(adminKey, 'true');
    window.sessionStorage.setItem(adminPasswordKey, password);
    return true;
  }

  return false;
}

export function lockAdmin() {
  window.localStorage.removeItem(adminKey);
  window.sessionStorage.removeItem(adminPasswordKey);
}

export function getAdminPassword() {
  if (!canUseStorage()) return '';
  return window.sessionStorage.getItem(adminPasswordKey) || '';
}
