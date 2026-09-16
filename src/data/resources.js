import { supabase } from '../utils/supabaseClient';

const apiPath = '/api/resources';

export const resourceCategories = [
  'LinkedIn Post',
  'Article',
  'Interview',
  'Talk',
  'Press',
  'Download',
];

export function createEmptyResource() {
  return {
    id: '',
    title: '',
    summary: '',
    body: '',
    category: 'LinkedIn Post',
    post_url: '',
    embed_url: '',
    image_url: '',
    image_alt: '',
    tags: [],
    published_at: new Date().toISOString().slice(0, 10),
    status: 'draft',
    featured: false,
    sort_order: 0,
  };
}

function normalizeResource(row) {
  return {
    ...createEmptyResource(),
    ...row,
    tags: Array.isArray(row?.tags) ? row.tags : [],
    published_at: row?.published_at || '',
  };
}

async function readResponsePayload(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 500) };
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/**
 * Detail URLs read well (title words) but resolve by the id prefix at the end,
 * so editing a title never breaks a link someone already shared.
 */
export function resourcePath(resource) {
  if (!resource?.id) return '';
  const prefix = resource.id.slice(0, 8);
  const titleSlug = slugify(resource.title);
  return `/resources/${titleSlug ? `${titleSlug}-${prefix}` : prefix}`;
}

export function findResourceBySlug(resources, slug) {
  const prefix = String(slug || '').match(/([0-9a-f]{8})$/i)?.[1]?.toLowerCase();
  if (!prefix) return null;
  return resources.find((resource) => resource.id?.toLowerCase().startsWith(prefix)) || null;
}

export function formatResourceDate(value, month = 'short') {
  if (!value) return '';
  // Date-only strings parse as UTC midnight, which shows the previous day west of GMT.
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' });
}

export function resourceParagraphs(resource) {
  return String(resource?.body || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// [first code point, ASCII it maps to] for the Unicode "bold" alphabets LinkedIn posts use.
const unicodeBoldRanges = [
  [0x1d400, 65, 26], // serif bold A-Z
  [0x1d41a, 97, 26], // serif bold a-z
  [0x1d5d4, 65, 26], // sans bold A-Z
  [0x1d5ee, 97, 26], // sans bold a-z
  [0x1d7ce, 48, 10], // serif bold 0-9
  [0x1d7ec, 48, 10], // sans bold 0-9
];
const boldChar = `[${unicodeBoldRanges
  .map(([start, , size]) => `\\u{${start.toString(16)}}-\\u{${(start + size - 1).toString(16)}}`)
  .join('')}]`;
// A run may contain spaces and punctuation between bold letters, but never a line break.
const boldRun = new RegExp(`${boldChar}(?:[ \\t,.;:'’"“”\\-–—→&!?()/]*${boldChar})*`, 'gu');

/** Turns pasted 𝗯𝗼𝗹𝗱 letters into readable, searchable **bold** text. */
export function fromUnicodeBold(text) {
  return String(text || '').replace(boldRun, (run) => {
    const plain = Array.from(run, (char) => {
      const code = char.codePointAt(0);
      const range = unicodeBoldRanges.find(([start, , size]) => code >= start && code < start + size);
      return range ? String.fromCharCode(range[1] + code - range[0]) : char;
    }).join('');
    return `**${plain}**`;
  });
}

const standaloneUrl = /^https?:\/\/\S+$/;

export function isImageUrl(url) {
  return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(String(url || ''));
}

export function isPdfUrl(url) {
  return /\.pdf(\?|#|$)/i.test(String(url || ''));
}

function isMediaParagraph(paragraph) {
  return standaloneUrl.test(paragraph) && (isImageUrl(paragraph) || isPdfUrl(paragraph));
}

/** Post text without the image/PDF link lines, for cards, quotes and descriptions. */
export function resourceTextParagraphs(resource) {
  return resourceParagraphs(resource).filter((paragraph) => !isMediaParagraph(paragraph));
}

/**
 * The detail page's reading order. An image link on its own line becomes an image,
 * consecutive ones become a page gallery (e.g. a LinkedIn document), and a PDF link
 * on its own line becomes a download button.
 */
export function resourceBlocks(resource) {
  return resourceParagraphs(resource).reduce((blocks, paragraph) => {
    const last = blocks.at(-1);
    if (standaloneUrl.test(paragraph) && isImageUrl(paragraph)) {
      if (last?.type === 'images') last.urls.push(paragraph);
      else blocks.push({ type: 'images', urls: [paragraph] });
    } else if (standaloneUrl.test(paragraph) && isPdfUrl(paragraph)) {
      blocks.push({ type: 'pdf', url: paragraph });
    } else {
      blocks.push({ type: 'text', text: paragraph });
    }
    return blocks;
  }, []);
}

export function stripBold(text) {
  return String(text || '').replace(/\*\*([^*]+)\*\*/g, '$1');
}

export function resourceReadingMinutes(resource) {
  const words = [resource?.title, ...resourceTextParagraphs(resource)].join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * The cover field holds an image or a video link. There is no separate poster
 * column: videos in the resource-media bucket are uploaded with a same-named
 * .jpg beside them, and anything else falls back to the video's first frame.
 */
export function isVideoMedia(url) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(url || ''));
}

export function videoPosterUrl(url) {
  if (!String(url || '').includes('/resource-media/')) return '';
  return url.replace(/\.(mp4|webm|mov|m4v)(?=\?|#|$)/i, '.jpg');
}

/** The shortest punchy paragraph makes a better pull quote than the opening line. */
export function resourcePullQuote(resource) {
  const candidates = resourceTextParagraphs(resource).filter((paragraph) => paragraph.length >= 20 && paragraph.length <= 140);
  if (candidates.length === 0) return '';
  return stripBold(candidates.reduce((shortest, paragraph) => (paragraph.length < shortest.length ? paragraph : shortest)));
}

/**
 * LinkedIn's share URLs and its embed URLs are different shapes. Visitors copy
 * whichever one they happen to have, so accept both and derive the embed form.
 */
export function toLinkedInEmbedUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';

  if (url.includes('/embed/feed/update/')) return url;

  const urn = url.match(/urn:li:(?:share|activity|ugcPost):\d+/)?.[0];
  if (urn) return `https://www.linkedin.com/embed/feed/update/${urn}`;

  const activityId = url.match(/activity-(\d+)/)?.[1];
  if (activityId) {
    return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}`;
  }

  return '';
}

/**
 * Public reads go straight to Supabase with the anon key so the page still works
 * when the serverless function is unavailable (for example `vite preview`).
 * RLS limits anon reads to published rows.
 */
export async function loadPublishedResources() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('status', 'published')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return { resources: data.map(normalizeResource), error: '' };
      }
    } catch {
      // fall through to the API route below
    }
  }

  try {
    const response = await fetch(apiPath, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const payload = await readResponsePayload(response);
    return {
      resources: (payload.resources || []).map(normalizeResource),
      error: payload.error || '',
    };
  } catch (error) {
    return { resources: [], error: error.message || 'Could not load resources.' };
  }
}

/** Admin read — includes drafts. Requires the admin password. */
export async function loadAllResources(adminPassword) {
  const response = await fetch(apiPath, {
    headers: { Accept: 'application/json', 'x-admin-password': adminPassword || '' },
    cache: 'no-store',
  });
  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(payload.error || `Could not load resources (HTTP ${response.status}).`);
  }

  if (payload.configured === false) {
    throw new Error(payload.error || 'Supabase is not configured.');
  }

  return (payload.resources || []).map(normalizeResource);
}

async function writeResource(method, body, adminPassword) {
  const response = await fetch(apiPath, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPassword || '',
    },
    body: JSON.stringify(body),
  });

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with HTTP ${response.status}.`);
  }

  return payload;
}

export async function createResource(resource, adminPassword) {
  const { id, ...rest } = resource;
  void id;
  const payload = await writeResource('POST', rest, adminPassword);
  return normalizeResource(payload.resource);
}

export async function updateResource(resource, adminPassword) {
  const payload = await writeResource('PUT', resource, adminPassword);
  return normalizeResource(payload.resource);
}

export async function deleteResource(id, adminPassword) {
  await writeResource('DELETE', { id }, adminPassword);
}

export async function reorderResources(ids, adminPassword) {
  await writeResource('PUT', { order: ids.map((id) => ({ id })) }, adminPassword);
}
