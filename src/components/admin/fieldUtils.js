export const ctaFields = new Set(['primarycta', 'secondarycta', 'tertiarycta']);

export const uploadableImageFields = new Set([
  'imageurl',
  'image',
  'logourl',
  'iconurl',
  'mediaurl',
  'backgroundimage',
]);

export const uploadMaxBytes = 2.5 * 1024 * 1024;

// Keys the editor never shows. Section `type` and `id` are structural, `hidden`
// has its own switch, and `layout` is not read by any renderer.
const sectionHiddenKeys = new Set(['id', 'type', 'hidden', 'layout']);
const nestedHiddenKeys = new Set(['id', 'hidden']);

export function hiddenKeysFor(depth) {
  return depth === 0 ? sectionHiddenKeys : nestedHiddenKeys;
}

// Section-level keys that change look rather than words; shown in a collapsed group.
export const appearanceKeys = new Set(['tone', 'wide', 'media', 'mediaItems', 'backgroundImage', 'backgroundVideo']);

export const fieldMeta = {
  eyebrow: { label: 'Small heading', hint: 'Short label shown above the title.' },
  title: { label: 'Title', max: 120 },
  subtitle: { label: 'Subtitle' },
  body: { label: 'Main text', multiline: true },
  supporting: { label: 'Supporting text', multiline: true },
  excerpt: { label: 'Excerpt', multiline: true },
  description: { label: 'Description', multiline: true },
  problem: { label: 'The problem', multiline: true },
  work: { label: 'The work', multiline: true },
  output: { label: 'The outcome', multiline: true },
  primaryCta: { label: 'Main button' },
  secondaryCta: { label: 'Second button' },
  tertiaryCta: { label: 'Third button' },
  label: { label: 'Label' },
  href: { label: 'Link', placeholder: '/contact or https://…' },
  tone: { label: 'Background' },
  wide: { label: 'Wide layout', hint: 'Lets the heading use the full page width.' },
  media: { label: 'Main image' },
  mediaItems: { label: 'Gallery', itemName: 'media item' },
  cards: { label: 'Cards', itemName: 'card' },
  items: { label: 'Detail cards', itemName: 'detail card' },
  bullets: { label: 'Bullet points', itemName: 'bullet' },
  proofPoints: { label: 'Proof points', itemName: 'proof point' },
  fields: { label: 'Fields', itemName: 'field' },
  options: { label: 'Dropdown options', itemName: 'option' },
  type: { label: 'Type' },
  mediaType: { label: 'Media type' },
  url: { label: 'Image or video' },
  alt: { label: 'Alt text', hint: 'Describes the image for screen readers and search engines.' },
  caption: { label: 'Caption' },
  icon: { label: 'Icon text', hint: 'Short text such as 01, used when there is no icon image.' },
  iconUrl: { label: 'Icon image' },
  logoUrl: { label: 'Logo image' },
  mediaUrl: { label: 'Card image' },
  backgroundImage: { label: 'Background image' },
  backgroundVideo: { label: 'Background video', placeholder: '/hero-background.mp4' },
  websiteUrl: { label: 'Website', placeholder: 'https://…' },
  bulletsLabel: { label: 'Bullets heading' },
  submitLabel: { label: 'Submit button text' },
  placeholder: { label: 'Placeholder text' },
  name: { label: 'Field name', hint: 'Internal name used in the submitted form.' },
  company: { label: 'Company' },
  sector: { label: 'Sector' },
  lane: { label: 'Lane' },
  value: { label: 'Value' },
  siteName: { label: 'Site name' },
  personName: { label: 'Person name' },
  tagline: { label: 'Tagline' },
  positioning: { label: 'Positioning line' },
  footerLine: { label: 'Footer line' },
  secondaryFooterLine: { label: 'Second footer line' },
  linkedinUrl: { label: 'LinkedIn profile', placeholder: 'https://www.linkedin.com/in/…' },
  inwardFireUrl: { label: 'TheValluru.org link' },
  contactEmail: { label: 'Contact email', placeholder: 'name@example.com' },
};

export function prettyLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

export function metaFor(key) {
  return fieldMeta[key] || { label: prettyLabel(key) };
}

export function optionsFor(key, path = []) {
  const lowerPath = path.map((part) => String(part).toLowerCase());

  if (key === 'tone') return [['light', 'Light'], ['dark', 'Dark']];
  if (key === 'mediaType') return [['image', 'Image'], ['video', 'Video']];

  if (key === 'type') {
    if (lowerPath.includes('fields')) {
      return [
        ['text', 'Text'],
        ['email', 'Email'],
        ['textarea', 'Long text'],
        ['select', 'Dropdown'],
        ['select-with-other', 'Dropdown + other'],
      ];
    }
    if (lowerPath.includes('media') || lowerPath.includes('mediaitems')) {
      return [['image', 'Image'], ['video', 'Video']];
    }
  }

  return null;
}

export const sectionTypes = {
  hero: { name: 'Hero', color: '#7c3aed' },
  'page-hero': { name: 'Page header', color: '#7c3aed' },
  cards: { name: 'Cards', color: '#0a66c2' },
  'detail-cards': { name: 'Detail cards', color: '#0891b2' },
  'text-flow': { name: 'Text', color: '#059669' },
  'proof-strip': { name: 'Proof strip', color: '#d97706' },
  'contact-form': { name: 'Contact form', color: '#db2777' },
};

export function sectionTypeInfo(type) {
  return sectionTypes[type] || { name: prettyLabel(type || 'section'), color: '#64748b' };
}

export function pagePath(pageKey) {
  return pageKey === 'home' ? '/' : `/${pageKey}`;
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isCtaField(label) {
  return ctaFields.has(String(label || '').toLowerCase());
}

export function createEmptyCta(label) {
  return {
    label: `${metaFor(label).label.replace(/\s*button$/i, '')} button`,
    href: '/',
  };
}

export function isUploadableImageField(label, path = []) {
  const normalizedLabel = String(label || '').toLowerCase();
  const normalizedPath = path.map((part) => String(part || '').toLowerCase());

  return (
    uploadableImageFields.has(normalizedLabel) ||
    (normalizedLabel === 'url' && (normalizedPath.includes('media') || normalizedPath.includes('mediaitems')))
  );
}

export function isVideoUrl(url) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url || ''));
}

export function itemThumbUrl(item) {
  if (!isPlainObject(item)) return '';
  const url = item.logoUrl || item.iconUrl || item.mediaUrl || item.url || item.media?.url || item.imageUrl || '';
  return url && !isVideoUrl(url) ? url : '';
}

export function itemTitle(item, index, itemName = 'item') {
  if (!isPlainObject(item)) return String(item || '');
  const name = itemName.charAt(0).toUpperCase() + itemName.slice(1);
  return item.title || item.label || item.company || item.name || item.caption || `${name} ${index + 1}`;
}

export function itemSnippet(item) {
  if (!isPlainObject(item)) return '';
  const text = item.body || item.value || item.problem || item.caption || item.placeholder || item.href || '';
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > 90 ? `${flat.slice(0, 90)}…` : flat;
}

function createEmptyLike(value) {
  if (Array.isArray(value)) return [];
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.keys(value).map((key) => [key, createEmptyLike(value[key])]));
  }
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return 0;
  return '';
}

export function moveArrayItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function duplicateArrayItem(item) {
  if (!isPlainObject(item)) return item;

  return {
    ...item,
    id: item.id ? `${item.id}-copy-${Date.now()}` : undefined,
    title: item.title ? `${item.title} Copy` : item.title,
    label: item.label ? `${item.label} Copy` : item.label,
  };
}

export function createArrayItem(label, items) {
  if (label === 'sections') {
    return {
      id: `section-${Date.now()}`,
      type: 'cards',
      hidden: false,
      layout: 'grid',
      eyebrow: 'New Section',
      title: 'New section title',
      body: 'Add section copy here.',
      cards: [{ hidden: false, icon: '01', iconUrl: '', logoUrl: '', title: 'New card', body: 'Add card copy here.', mediaUrl: '', mediaType: 'image' }],
      mediaItems: [],
    };
  }

  if (label === 'cards') return { hidden: false, icon: '01', iconUrl: '', logoUrl: '', title: 'New card', body: 'Add card copy here.', mediaUrl: '', mediaType: 'image' };
  if (label === 'items') return { hidden: false, icon: '01', iconUrl: '', logoUrl: '', title: 'New item', body: 'Add item copy here.', mediaUrl: '', mediaType: 'image' };
  if (label === 'fields') {
    if (items.some((item) => Object.prototype.hasOwnProperty.call(item, 'value'))) {
      return { label: 'New label', value: 'New text' };
    }

    return { label: 'New Field', name: `field${Date.now()}`, type: 'text', placeholder: 'Placeholder text' };
  }
  if (label === 'mediaItems') return { hidden: false, type: 'image', url: '', alt: '', title: '', caption: '' };

  const holdsObjects = items.length > 0 && isPlainObject(items[0]);
  if (label === 'bullets' && !holdsObjects) return 'New bullet';
  if (label === 'proofPoints' && !holdsObjects) return 'New point';

  if (!items.length) return '';
  return createEmptyLike(items[items.length - 1]);
}
