import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  defaultTheme,
  getTheme,
  isAdminUnlocked,
  lockAdmin,
  getAdminPassword,
  resetCms,
  saveSiteContent,
  saveTheme,
  unlockAdmin,
} from '../data/cms';
import { defaultSiteContent, siteContent } from '../data/content';
import { checkLiveCms, saveLiveCms } from '../data/liveCms';

const colorFields = [
  ['deepNavy', 'Charcoal'],
  ['midNavy', 'Dark Grey'],
  ['gold', 'LinkedIn Blue'],
  ['warmWhite', 'LinkedIn Background'],
  ['surfaceGrey', 'Divider Grey'],
  ['mutedBlue', 'Muted Text'],
  ['accentCopper', 'Deep Link Blue'],
];

const panels = [
  ['brand', 'Brand'],
  ['nav', 'Navigation'],
  ['pages', 'Pages'],
];

const uploadableImageFields = new Set([
  'imageurl',
  'image',
  'logourl',
  'iconurl',
  'mediaurl',
  'backgroundimage',
]);

const uploadMaxBytes = 2.5 * 1024 * 1024;

const designFields = [
  {
    key: 'sectionSpacing',
    label: 'Section spacing',
    options: [
      ['compact', 'Compact'],
      ['normal', 'Normal'],
      ['spacious', 'Spacious'],
    ],
  },
  {
    key: 'cardStyle',
    label: 'Card shadow',
    options: [
      ['flat', 'Flat'],
      ['elevated', 'Elevated'],
      ['premium', 'Premium'],
    ],
  },
  {
    key: 'cornerRadius',
    label: 'Corner radius',
    options: [
      ['sharp', 'Sharp'],
      ['soft', 'Soft'],
      ['rounded', 'Rounded'],
    ],
  },
  {
    key: 'logoSize',
    label: 'Logo size',
    options: [
      ['small', 'Small'],
      ['medium', 'Medium'],
      ['large', 'Large'],
    ],
  },
  {
    key: 'animationIntensity',
    label: 'Animation intensity',
    options: [
      ['calm', 'Calm'],
      ['normal', 'Normal'],
      ['expressive', 'Expressive'],
    ],
  },
  {
    key: 'heroMediaOpacity',
    label: 'Hero media visibility',
    options: [
      ['quiet', 'Quiet'],
      ['subtle', 'Subtle'],
      ['visible', 'Visible'],
    ],
  },
  {
    key: 'heroOverlay',
    label: 'Hero dark overlay',
    options: [
      ['medium', 'Medium'],
      ['strong', 'Strong'],
      ['heavy', 'Heavy'],
    ],
  },
  {
    key: 'fontScale',
    label: 'Font scale',
    options: [
      ['compact', 'Compact'],
      ['normal', 'Normal'],
      ['large', 'Large'],
    ],
  },
];

function prettyLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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

function moveArrayItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

function duplicateArrayItem(item) {
  if (!isPlainObject(item)) return item;

  return {
    ...item,
    id: item.id ? `${item.id}-copy-${Date.now()}` : undefined,
    title: item.title ? `${item.title} Copy` : item.title,
    label: item.label ? `${item.label} Copy` : item.label,
  };
}

function createArrayItem(label, items) {
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
  if (label === 'bullets') return 'New bullet';
  if (label === 'proofPoints') return 'New point';

  if (!items.length) return '';
  return createEmptyLike(items[items.length - 1]);
}

function normalizeDetailCardItem(item) {
  if (!isPlainObject(item) || Array.isArray(item.fields)) return item;

  const baseKeys = ['hidden', 'title', 'company', 'lane', 'sector', 'icon', 'iconUrl', 'logoUrl', 'media', 'mediaUrl', 'mediaType', 'websiteUrl', 'url'];
  const base = Object.fromEntries(Object.entries(item).filter(([key]) => baseKeys.includes(key)));
  const fields = Object.entries(item)
    .filter(([key, value]) => (
      !baseKeys.includes(key) &&
      value !== null &&
      value !== undefined &&
      String(value).trim().length > 0
    ))
    .map(([key, value]) => ({
      label: prettyLabel(key),
      value: String(value),
    }));

  return { ...base, fields };
}

function normalizeArrayVisibility(items) {
  return (items || []).map((item) => (
    isPlainObject(item) && !Object.prototype.hasOwnProperty.call(item, 'hidden')
      ? { hidden: false, ...item }
      : item
  ));
}

function normalizeSection(section) {
  const nextSection = {
    hidden: false,
    layout: section.layout || 'default',
    ...section,
  };

  if (nextSection.cards) nextSection.cards = normalizeArrayVisibility(nextSection.cards);
  if (nextSection.items) nextSection.items = normalizeArrayVisibility(nextSection.items).map((item) => (
    nextSection.type === 'detail-cards' ? normalizeDetailCardItem(item) : item
  ));
  if (nextSection.fields) nextSection.fields = normalizeArrayVisibility(nextSection.fields);
  if (nextSection.mediaItems) nextSection.mediaItems = normalizeArrayVisibility(nextSection.mediaItems);

  return nextSection;
}

function sectionName(section) {
  return section.eyebrow || section.title || section.id;
}

function sectionSummary(section) {
  if (section.hidden) return 'Hidden section';
  if (section.type === 'contact-form') return `${section.fields?.length || 0} form fields`;
  if (section.cards?.length) return `${section.cards.length} cards`;
  if (section.items?.length) return `${section.items.length} detail cards`;
  if (section.bullets?.length) return `${section.bullets.length} bullets`;
  return prettyLabel(section.type || 'section');
}

function PageDashboard({ pages, activePage, onSelectSection }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {Object.entries(pages).map(([pageKey, page]) => {
        const sections = page.sections || [];

        return (
          <article
            key={pageKey}
            className={`rounded-xl border bg-white p-5 shadow-lg shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-xl ${
              activePage === pageKey ? 'border-[var(--gold)]' : 'border-[var(--surface-grey)]'
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[var(--gold)]">{prettyLabel(pageKey)}</p>
                <h3 className="mt-2 text-xl font-bold text-[var(--deep-navy)]">{page.title || prettyLabel(pageKey)}</h3>
              </div>
              <span className="rounded-full bg-[var(--warm-white)] px-3 py-1 text-xs font-bold text-[var(--muted-blue)]">
                {sections.length} sections
              </span>
            </div>

            <div className="grid gap-2">
              {sections.slice(0, 4).map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-3 py-2 text-left transition hover:border-[var(--gold)] hover:bg-white"
                  onClick={() => {
                    onSelectSection(pageKey, section.id);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[var(--deep-navy)]">{sectionName(section)}</span>
                    <span className="text-xs font-semibold text-[var(--muted-blue)]">{sectionSummary(section)}</span>
                  </span>
                  <span className="text-sm font-black text-[var(--gold)] transition group-hover:translate-x-0.5">Edit</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-[var(--mid-navy)] px-4 py-2 text-sm font-bold text-[var(--deep-navy)] transition hover:border-[var(--gold)] hover:bg-[var(--warm-white)]"
              onClick={() => {
                onSelectSection(pageKey, sections[0]?.id);
              }}
            >
              Open page editor
            </button>
          </article>
        );
      })}
    </div>
  );
}

function normalizeEditableContent(value) {
  if (!value?.pages) return value;

  return {
    ...value,
    pages: Object.fromEntries(
      Object.entries(value.pages).map(([pageKey, page]) => [
        pageKey,
        {
          ...page,
          blogs: pageKey === 'insights' ? (page.blogs || []) : page.blogs,
          sections: (page.sections || []).map(normalizeSection),
        },
      ]),
    ),
  };
}

function createBlogPost() {
  const now = new Date();
  return {
    id: `blog-${now.getTime()}`,
    title: 'New blog title',
    subtitle: '',
    category: 'AI Operations',
    date: now.toISOString().slice(0, 10),
    author: 'Sasidhar Valluru',
    excerpt: 'Short summary for the blog card.',
    body: 'Write the full blog here. Use blank lines between paragraphs.',
    imageUrl: '',
    imageAlt: '',
    sourceUrl: '',
    status: 'draft',
    featured: false,
  };
}

function BlogManager({ blogs = [], onChange }) {
  const [activeBlogId, setActiveBlogId] = useState(blogs[0]?.id || '');
  const activeBlog = blogs.find((blog) => blog.id === activeBlogId) || blogs[0];

  function updateBlog(blogId, patch) {
    onChange(blogs.map((blog) => (blog.id === blogId ? { ...blog, ...patch } : blog)));
  }

  function addBlog() {
    const nextBlog = createBlogPost();
    onChange([nextBlog, ...blogs]);
    setActiveBlogId(nextBlog.id);
  }

  function duplicateBlog(blog) {
    const nextBlog = {
      ...blog,
      id: `blog-${Date.now()}`,
      title: `${blog.title} Copy`,
      status: 'draft',
      featured: false,
    };
    onChange([nextBlog, ...blogs]);
    setActiveBlogId(nextBlog.id);
  }

  function deleteBlog(blogId) {
    const nextBlogs = blogs.filter((blog) => blog.id !== blogId);
    onChange(nextBlogs);
    setActiveBlogId(nextBlogs[0]?.id || '');
  }

  return (
    <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow mb-2">Insights Blog Manager</p>
          <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Create, edit, publish, and delete blogs</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-blue)]">
            Draft posts stay hidden. Published posts appear on the Insights page after saving live.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={addBlog}>Add blog</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="grid content-start gap-3">
          {blogs.length === 0 && (
            <div className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4 text-sm font-semibold text-[var(--muted-blue)]">
              No blogs yet. Click Add blog to start.
            </div>
          )}

          {blogs.map((blog) => (
            <button
              key={blog.id}
              type="button"
              onClick={() => setActiveBlogId(blog.id)}
              className={`rounded-lg border p-4 text-left transition hover:border-[var(--gold)] ${
                activeBlog?.id === blog.id ? 'border-[var(--gold)] bg-white' : 'border-[var(--surface-grey)] bg-[var(--warm-white)]'
              }`}
            >
              <span className="text-xs font-black tracking-[0.16em] text-[var(--gold)]">{blog.status || 'draft'}</span>
              <span className="mt-2 block text-base font-bold text-[var(--deep-navy)]">{blog.title || 'Untitled blog'}</span>
              <span className="mt-1 block text-xs font-semibold text-[var(--muted-blue)]">{blog.category || 'No category'} · {blog.date || 'No date'}</span>
            </button>
          ))}
        </div>

        {activeBlog && (
          <div className="grid gap-5 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--deep-navy)]">{activeBlog.title || 'Untitled blog'}</h3>
                <p className="text-sm text-[var(--muted-blue)]">Blog ID: {activeBlog.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="rounded-md border border-[var(--surface-grey)] bg-white px-3 py-2 text-sm font-bold text-[var(--deep-navy)]" onClick={() => duplicateBlog(activeBlog)}>
                  Duplicate
                </button>
                <button type="button" className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700" onClick={() => deleteBlog(activeBlog.id)}>
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="title" value={activeBlog.title} onChange={(value) => updateBlog(activeBlog.id, { title: value })} />
              <TextField label="subtitle" value={activeBlog.subtitle} onChange={(value) => updateBlog(activeBlog.id, { subtitle: value })} />
              <TextField label="category" value={activeBlog.category} onChange={(value) => updateBlog(activeBlog.id, { category: value })} />
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--deep-navy)]">Date</span>
                <input
                  type="date"
                  value={activeBlog.date || ''}
                  onChange={(event) => updateBlog(activeBlog.id, { date: event.target.value })}
                  className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                />
              </label>
              <TextField label="author" value={activeBlog.author} onChange={(value) => updateBlog(activeBlog.id, { author: value })} />
              <TextField label="imageUrl" value={activeBlog.imageUrl} onChange={(value) => updateBlog(activeBlog.id, { imageUrl: value })} />
              <TextField label="imageAlt" value={activeBlog.imageAlt} onChange={(value) => updateBlog(activeBlog.id, { imageAlt: value })} />
              <TextField label="sourceUrl" value={activeBlog.sourceUrl} onChange={(value) => updateBlog(activeBlog.id, { sourceUrl: value })} />
              <label className="grid gap-2">
                <span className="text-sm font-bold text-[var(--deep-navy)]">Status</span>
                <select
                  value={activeBlog.status || 'draft'}
                  onChange={(event) => updateBlog(activeBlog.id, { status: event.target.value })}
                  className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm font-semibold text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <BooleanField label="featured" value={activeBlog.featured} onChange={(value) => updateBlog(activeBlog.id, { featured: value })} />
              <div className="md:col-span-2">
                <TextField label="excerpt" value={activeBlog.excerpt} onChange={(value) => updateBlog(activeBlog.id, { excerpt: value })} />
              </div>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-bold text-[var(--deep-navy)]">Blog Body</span>
                <textarea
                  value={activeBlog.body || ''}
                  onChange={(event) => updateBlog(activeBlog.id, { body: event.target.value })}
                  className="min-h-[22rem] rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm leading-7 text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                  placeholder="Write or paste your full blog here. Use blank lines between paragraphs."
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }) {
  const text = value ?? '';
  const multiline = text.length > 90 || ['body', 'supporting', 'description'].includes(label);

  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</span>
      {multiline ? (
        <textarea
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-28 rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
        />
      ) : (
        <input
          value={text}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
        />
      )}
    </label>
  );
}

function BooleanField({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[var(--gold)]"
      />
      <span className="text-sm font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</span>
    </label>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</span>
      <input
        type="number"
        value={value ?? 0}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
      />
    </label>
  );
}

function isUploadableImageField(label, path = []) {
  const normalizedLabel = String(label || '').toLowerCase();
  const normalizedPath = path.map((part) => String(part || '').toLowerCase());

  return (
    uploadableImageFields.has(normalizedLabel) ||
    (normalizedLabel === 'url' && normalizedPath.includes('media'))
  );
}

function MediaUploadField({ label, value, onChange }) {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const text = value ?? '';

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Use an image file for this field.');
      return;
    }

    if (file.size > uploadMaxBytes) {
      setUploadError('Image is too large. Use an image under 2.5 MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      fallbackBase64Upload(file);
    } finally {
      setIsUploading(false);
    }
  }

  function fallbackBase64Upload(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const maxWidth = 1200;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              setUploadError('Could not compress image.');
              return;
            }

            const compressedReader = new FileReader();
            compressedReader.onload = () => {
              const dataUrl = String(compressedReader.result || '');
              const originalSize = (file.size / 1024).toFixed(1);
              const compressedSize = (blob.size / 1024).toFixed(1);
              const savings = ((1 - blob.size / file.size) * 100).toFixed(0);
              setUploadError(`✓ ${originalSize}KB → ${compressedSize}KB (${savings}% smaller)`);
              onChange(dataUrl);
            };
            compressedReader.readAsDataURL(blob);
          },
          'image/webp',
          0.75
        );
      };
      img.src = String(event.target.result || '');
    };
    reader.onerror = () => {
      setUploadError('Could not read this file. Try another image.');
    };
    reader.readAsDataURL(file);
  }

  const displayLabel = text?.startsWith('data:')
    ? '📷 Image uploaded (compressed)'
    : text && text.startsWith('http')
    ? '📷 Image URL'
    : null;

  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</span>
      <input
        value={text}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste image URL or upload from device"
        className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="relative inline-flex">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label={`Upload ${prettyLabel(label)}`}
          />
          <span className="rounded-md border border-[var(--gold)] bg-white px-3 py-2 text-xs font-bold text-[var(--deep-navy)] disabled:opacity-50">
            {isUploading ? 'Uploading...' : 'Upload from device'}
          </span>
        </span>
        {text && (
          <button
            type="button"
            className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700"
            onClick={() => onChange('')}
          >
            Clear
          </button>
        )}
      </div>
      {text && (
        <div className="overflow-hidden rounded-lg border border-[var(--surface-grey)] bg-white p-2">
          <div className="flex gap-2">
            <img src={text} alt="" className="h-16 w-16 flex-shrink-0 rounded object-contain" />
            <div className="min-w-0 flex-1 py-1">
              <p className="text-xs font-semibold text-[var(--deep-navy)]">{displayLabel}</p>
              <p className="mt-1 text-xs text-[var(--muted-blue)]">
                {text?.startsWith('data:')
                  ? `✓ Stored in database (${(text.length / 1024).toFixed(0)}KB)`
                  : text?.substring(0, 50) + (text?.length > 50 ? '...' : '')}
              </p>
            </div>
          </div>
        </div>
      )}
      {uploadError && <span className="text-xs font-semibold text-green-700">{uploadError}</span>}
    </label>
  );
}

function FieldEditor({ label, value, onChange, depth = 0, path = [] }) {
  if (typeof value === 'boolean') {
    return <BooleanField label={label} value={value} onChange={onChange} />;
  }

  if (typeof value === 'number') {
    return <NumberField label={label} value={value} onChange={onChange} />;
  }

  if (Array.isArray(value)) {
    const primitiveItems = value.every((item) => !isPlainObject(item) && !Array.isArray(item));

    return (
      <div className="grid gap-3 rounded-xl border border-[var(--surface-grey)] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</h4>
          <button
            type="button"
            className="rounded-md border border-[var(--gold)] px-3 py-2 text-sm font-bold text-[var(--deep-navy)] hover:bg-[var(--warm-white)]"
            onClick={() => onChange([...value, createArrayItem(label, value)])}
          >
            Add
          </button>
        </div>

        {value.length === 0 && <p className="text-sm text-[var(--muted-blue)]">No items yet.</p>}

        <div className="grid gap-3">
          {value.map((item, index) => (
            <div
              key={`${label}-${index}`}
              id={item?.id ? `admin-${item.id}` : undefined}
              className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] p-3 scroll-mt-28"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-blue)]">
                  {primitiveItems ? `Item ${index + 1}` : item.title || item.label || item.id || `Item ${index + 1}`}
                  {item?.hidden ? ' - Hidden' : ''}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[var(--surface-grey)] bg-white px-2 py-1 text-xs font-bold text-[var(--deep-navy)] disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() => onChange(moveArrayItem(value, index, index - 1))}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[var(--surface-grey)] bg-white px-2 py-1 text-xs font-bold text-[var(--deep-navy)] disabled:opacity-40"
                    disabled={index === value.length - 1}
                    onClick={() => onChange(moveArrayItem(value, index, index + 1))}
                  >
                    Down
                  </button>
                  {!primitiveItems && (
                    <button
                      type="button"
                      className="rounded-md border border-[var(--surface-grey)] bg-white px-2 py-1 text-xs font-bold text-[var(--deep-navy)]"
                      onClick={() => {
                        const next = [...value];
                        next.splice(index + 1, 0, duplicateArrayItem(item));
                        onChange(next);
                      }}
                    >
                      Duplicate
                    </button>
                  )}
                  {!primitiveItems && Object.prototype.hasOwnProperty.call(item, 'hidden') && (
                    <button
                      type="button"
                      className="rounded-md border border-[var(--surface-grey)] bg-white px-2 py-1 text-xs font-bold text-[var(--deep-navy)]"
                      onClick={() => {
                        const next = [...value];
                        next[index] = { ...item, hidden: !item.hidden };
                        onChange(next);
                      }}
                    >
                      {item.hidden ? 'Show' : 'Hide'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-bold text-red-700"
                    onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <FieldEditor
                label={primitiveItems ? label : `item-${index + 1}`}
                value={item}
                depth={depth + 1}
                path={[...path, label, index]}
                onChange={(nextItem) => {
                  const next = [...value];
                  next[index] = nextItem;
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <div className={depth === 0 ? 'grid gap-5' : 'grid gap-4 rounded-xl border border-[var(--surface-grey)] bg-white p-4'}>
        {depth > 0 && <h4 className="font-bold text-[var(--deep-navy)]">{prettyLabel(label)}</h4>}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(value).map(([key, childValue]) => (
            <div key={key} className={isPlainObject(childValue) || Array.isArray(childValue) ? 'md:col-span-2' : ''}>
              <FieldEditor
                label={key}
                value={childValue}
                depth={depth + 1}
                path={[...path, label]}
                onChange={(nextChildValue) => onChange({ ...value, [key]: nextChildValue })}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isUploadableImageField(label, path)) {
    return <MediaUploadField label={label} value={value} onChange={onChange} />;
  }

  return <TextField label={label} value={value} onChange={onChange} />;
}

function DesignSettings({ design, onChange }) {
  return (
    <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
      <h2 className="mb-2 text-2xl font-bold text-[var(--deep-navy)]">Design Settings</h2>
      <p className="mb-5 text-sm text-[var(--muted-blue)]">
        Safe UI controls for changing the site look without editing code or raw CSS.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {designFields.map((field) => (
          <label key={field.key} className="grid gap-2">
            <span className="font-semibold text-[var(--deep-navy)]">{field.label}</span>
            <select
              value={design?.[field.key] || field.options[0][0]}
              onChange={(event) => onChange({ ...design, [field.key]: event.target.value })}
              className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-3 py-3 text-sm font-semibold text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
            >
              {field.options.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function updateHeroImage(section, value) {
  return {
    media: {
      ...(section.media || {}),
      type: 'image',
      url: value,
    },
  };
}

function HeroBackgrounds({ pages, onUpdateSection }) {
  const heroSections = Object.entries(pages).flatMap(([pageKey, page]) => (
    (page.sections || [])
      .filter((section) => section.type === 'hero' || section.type === 'page-hero')
      .map((section) => ({ pageKey, pageTitle: page.title || prettyLabel(pageKey), section }))
  ));

  return (
    <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
      <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Hero Media</h2>
      <p className="mt-2 text-sm text-[var(--muted-blue)]">
        Set hero background media for every page from one place. For the home hero portrait, paste an image URL or upload from your device.
      </p>
      <div className="mt-5 grid gap-4">
        {heroSections.map(({ pageKey, pageTitle, section }) => (
          <div key={`${pageKey}-${section.id}`} className="grid gap-4 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4 lg:grid-cols-[12rem_1fr_1fr] xl:grid-cols-[12rem_1fr_1fr_1fr]">
            <div>
              <p className="text-sm font-bold text-[var(--deep-navy)]">{pageTitle}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-blue)]">{section.eyebrow || section.id}</p>
            </div>
            {section.type === 'hero' && (
              <MediaUploadField
                label="heroImage"
                value={section.media?.url || ''}
                onChange={(value) => onUpdateSection(pageKey, section.id, updateHeroImage(section, value))}
              />
            )}
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--deep-navy)]">Background video path</span>
              <input
                value={section.backgroundVideo || ''}
                onChange={(event) => onUpdateSection(pageKey, section.id, { backgroundVideo: event.target.value })}
                placeholder="/hero-background.mp4"
                className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
              />
            </label>
            <MediaUploadField
              label="backgroundImage"
              value={section.backgroundImage || ''}
              onChange={(value) => onUpdateSection(pageKey, section.id, { backgroundImage: value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [liveStatus, setLiveStatus] = useState('');
  const [theme, setTheme] = useState(() => getTheme());
  const [content, setContent] = useState(() => normalizeEditableContent(siteContent));
  const [activePanel, setActivePanel] = useState(() => (searchParams.get('page') ? 'pages' : 'brand'));
  const [activePage, setActivePage] = useState(() => searchParams.get('page') || 'home');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [contentJson, setContentJson] = useState(() => JSON.stringify(normalizeEditableContent(siteContent), null, 2));
  const fileInputRef = useRef(null);
  const contentSize = useMemo(() => JSON.stringify(content).length.toLocaleString(), [content]);

  const saveCurrentChanges = useCallback(async () => {
    const parsedContent = advancedOpen ? JSON.parse(contentJson) : content;
    const adminPassword = getAdminPassword();

    if (!adminPassword) {
      throw new Error('Admin session expired. Lock admin, unlock again, then save.');
    }

    await saveLiveCms({
      content: parsedContent,
      theme,
      adminPassword,
    });
    saveSiteContent(parsedContent);
    saveTheme(theme);
    setStatus('Saved locally and to live storage.');
    setError('');
  }, [advancedOpen, content, contentJson, theme]);

  function handleUnlock(event) {
    event.preventDefault();
    if (unlockAdmin(password)) {
      setUnlocked(true);
      setError('');
      return;
    }

    setError('Invalid admin password.');
  }

  async function handleSave(event) {
    event.preventDefault();

    try {
      await saveCurrentChanges();
      window.location.reload();
    } catch (error) {
      setError(`${error.message || 'Live save failed.'} The change was not saved for other browsers. Check Vercel environment variables and use "Save local only" only for testing.`);
    }
  }

  async function handleLocalOnlySave() {
    try {
      const parsedContent = advancedOpen ? JSON.parse(contentJson) : content;
      saveSiteContent(parsedContent);
      saveTheme(theme);
      setStatus('Saved locally only. Live storage was not updated.');
      setError('');
      window.location.reload();
    } catch {
      setError('Content JSON is not valid. Fix the JSON before saving.');
    }
  }

  async function handleCheckLiveStorage() {
    setLiveStatus('Checking live storage...');
    const result = await checkLiveCms();

    if (!result.ok) {
      setLiveStatus(`Live storage is not reachable: ${result.error}`);
      return;
    }

    if (result.data?.configured === false) {
      setLiveStatus(`Live storage is not configured: ${result.data.error}`);
      return;
    }

    if (result.data?.updatedAt) {
      setLiveStatus(`Live storage is working. Last live update: ${new Date(result.data.updatedAt).toLocaleString()}`);
      return;
    }

    setLiveStatus('Live storage is reachable, but no saved live content exists yet.');
  }

  useEffect(() => {
    if (!unlocked) return undefined;

    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveCurrentChanges().catch((error) => {
          setError(`${error.message || 'Live save failed.'} The change was not saved for other browsers. Check live storage.`);
        });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentChanges, unlocked]);

  function handleReset() {
    resetCms();
    setTheme(defaultTheme);
    setContent(normalizeEditableContent(defaultSiteContent));
    setContentJson(JSON.stringify(normalizeEditableContent(defaultSiteContent), null, 2));
    window.location.reload();
  }

  function handleExport() {
    const backup = {
      exportedAt: new Date().toISOString(),
      theme,
      content,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thevalluru-content-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const nextContent = normalizeEditableContent(imported.content || imported);
        const nextTheme = imported.theme || theme;
        setContent(nextContent);
        setContentJson(JSON.stringify(nextContent, null, 2));
        setTheme(nextTheme);
        setError('');
        setStatus('Backup loaded. Click Save changes to apply it.');
      } catch {
        setError('The selected file is not valid JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function updatePanel(panel, value) {
    const nextContent = { ...content, [panel]: value };
    setContent(nextContent);
    setContentJson(JSON.stringify(nextContent, null, 2));
  }

  function updatePage(pageKey, value) {
    const nextContent = {
      ...content,
      pages: {
        ...content.pages,
        [pageKey]: value,
      },
    };
    setContent(nextContent);
    setContentJson(JSON.stringify(nextContent, null, 2));
  }

  function updateInsightsBlogs(blogs) {
    updatePage('insights', {
      ...content.pages.insights,
      blogs,
    });
  }

  function updateSection(pageKey, sectionId, sectionPatch) {
    const page = content.pages[pageKey];
    const nextSections = page.sections.map((section) => (section.id === sectionId ? { ...section, ...sectionPatch } : section));
    updatePage(pageKey, { ...page, sections: nextSections });
  }

  const heroSections = content.pages[activePage]?.sections?.filter((section) => section.type === 'hero' || section.type === 'page-hero') || [];

  function jumpToSection(pageKey, sectionId) {
    setActivePanel('pages');
    setActivePage(pageKey);
    if (!sectionId) return;

    window.setTimeout(() => {
      document.getElementById(`admin-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  useEffect(() => {
    const sectionId = searchParams.get('section');
    const pageKey = searchParams.get('page');
    if (unlocked && pageKey && sectionId) {
      window.setTimeout(() => jumpToSection(pageKey, sectionId), 0);
    }
  }, [searchParams, unlocked]);

  if (!unlocked) {
    return (
      <section className="min-h-[70vh] bg-[var(--warm-white)] py-20">
        <div className="container-custom">
          <form onSubmit={handleUnlock} className="mx-auto max-w-md rounded-xl border border-[var(--surface-grey)] bg-white p-8 shadow-lg shadow-slate-900/10">
            <p className="eyebrow mb-4">Admin</p>
            <h1 className="mb-6 text-3xl font-bold text-[var(--deep-navy)]">Unlock content editor</h1>
            <label className="grid gap-2">
              <span className="font-semibold text-[var(--deep-navy)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 outline-none focus:border-[var(--gold)]"
                placeholder="Enter admin password"
              />
            </label>
            {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" className="btn-primary mt-6 w-full">Unlock</button>
            <p className="mt-4 text-sm text-[var(--muted-blue)]">
              Use the ADMIN_PASSWORD configured in Vercel. Unlocking again refreshes the password used for live saves.
            </p>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--warm-white)] py-16">
      <div className="container-custom">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4">Admin CMS</p>
            <h1 className="text-4xl font-bold text-[var(--deep-navy)]">Edit site content and colors</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted-blue)]">
              Edit every page from here. Changes are saved in this browser so you can manage the site without touching code.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white"
            onClick={() => {
              lockAdmin();
              setUnlocked(false);
            }}
          >
            Lock admin
          </button>
        </div>

        <div className="mb-8 rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
          <h2 className="text-2xl font-bold text-[var(--deep-navy)]">How this editor works</h2>
          <p className="mt-3 text-[var(--muted-blue)]">
            This editor saves to live storage first, then mirrors the same changes in this browser for faster loading.
            If live storage is not configured, other browsers will not see the update.
          </p>
          <div className="mt-4 rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--deep-navy)]">Live sync status</p>
                <p className="mt-1 text-sm text-[var(--muted-blue)]">
                  Use this to confirm changes will appear in another browser/profile.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCheckLiveStorage}
                className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white"
              >
                Check live storage
              </button>
            </div>
            {liveStatus && <p className="mt-3 text-sm font-semibold text-[var(--deep-navy)]">{liveStatus}</p>}
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--deep-navy)]">
            Use iconUrl or logoUrl for small logo/icon images. Use mediaUrl for full card images or videos.
            Public assets should be placed in the public folder and referenced like /logo.png or /video.mp4.
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--deep-navy)]">
            Shortcut: press Ctrl+S to save changes without scrolling to the save button.
          </p>
        </div>

        <form onSubmit={handleSave} className="grid gap-8">
          <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-2">Page Dashboard</p>
                <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Jump into any page or section</h2>
              </div>
              <p className="max-w-sm text-sm text-[var(--muted-blue)]">
                Use these cards for normal edits. Use advanced JSON only for bulk changes.
              </p>
            </div>
            <PageDashboard
              pages={content.pages}
              activePage={activePage}
              onSelectSection={jumpToSection}
            />
          </div>

          <BlogManager blogs={content.pages.insights?.blogs || []} onChange={updateInsightsBlogs} />

          <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
            <h2 className="mb-5 text-2xl font-bold text-[var(--deep-navy)]">Colors</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {colorFields.map(([key, label]) => (
                <label key={key} className="grid gap-2">
                  <span className="font-semibold text-[var(--deep-navy)]">{label}</span>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={(event) => setTheme((value) => ({ ...value, [key]: event.target.value }))}
                      className="h-11 w-14 rounded border border-[var(--surface-grey)]"
                    />
                    <input
                      value={theme[key]}
                      onChange={(event) => setTheme((value) => ({ ...value, [key]: event.target.value }))}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--surface-grey)] bg-[var(--warm-white)] px-3 py-2 outline-none focus:border-[var(--gold)]"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <DesignSettings
            design={theme.design}
            onChange={(nextDesign) => setTheme((value) => ({ ...value, design: nextDesign }))}
          />

          <HeroBackgrounds pages={content.pages} onUpdateSection={updateSection} />

          <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Content editor</h2>
                <p className="mt-1 text-sm text-[var(--muted-blue)]">{contentSize} saved characters</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {panels.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivePanel(key)}
                    className={`rounded-md border px-4 py-2 text-sm font-bold ${
                      activePanel === key
                        ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--deep-navy)]'
                        : 'border-[var(--surface-grey)] text-[var(--deep-navy)] hover:bg-[var(--warm-white)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activePanel === 'pages' ? (
              <div className="grid gap-6">
                <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-3">
                  {Object.entries(content.pages).map(([pageKey, page]) => (
                    <button
                      key={pageKey}
                      type="button"
                      onClick={() => setActivePage(pageKey)}
                      className={`rounded-md border px-4 py-2 text-sm font-bold ${
                        activePage === pageKey
                          ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--deep-navy)]'
                          : 'border-[var(--surface-grey)] bg-white text-[var(--deep-navy)] hover:bg-[var(--warm-white)]'
                      }`}
                    >
                      {page.title || prettyLabel(pageKey)}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4">
                  <h3 className="mb-3 text-lg font-bold text-[var(--deep-navy)]">Sections on {content.pages[activePage]?.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.pages[activePage]?.sections?.map((section, index) => (
                      <a
                        key={section.id}
                        href={`#admin-${section.id}`}
                        className="rounded-md border border-[var(--surface-grey)] bg-white px-3 py-2 text-sm font-bold text-[var(--deep-navy)] hover:border-[var(--gold)]"
                      >
                        {index + 1}. {section.eyebrow || section.title || section.id}
                      </a>
                    ))}
                  </div>
                </div>

                {heroSections.length > 0 && (
                  <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-5 shadow-sm shadow-slate-900/10">
                    <h3 className="text-lg font-bold text-[var(--deep-navy)]">Hero media for {content.pages[activePage]?.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted-blue)]">
                      Paste hosted media URLs, reference files from public, or upload the home hero portrait from your device.
                    </p>
                    <div className="mt-5 grid gap-5">
                      {heroSections.map((section) => (
                        <div key={section.id} className="grid gap-4 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <p className="text-sm font-bold text-[var(--deep-navy)]">{section.eyebrow || section.title}</p>
                          </div>
                          {section.type === 'hero' && (
                            <MediaUploadField
                              label="heroImage"
                              value={section.media?.url || ''}
                              onChange={(value) => updateSection(activePage, section.id, updateHeroImage(section, value))}
                            />
                          )}
                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-[var(--deep-navy)]">Background video path</span>
                            <input
                              value={section.backgroundVideo || ''}
                              onChange={(event) => updateSection(activePage, section.id, { backgroundVideo: event.target.value })}
                              placeholder="/hero-background.mp4"
                              className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                            />
                          </label>
                          <MediaUploadField
                            label="backgroundImage"
                            value={section.backgroundImage || ''}
                            onChange={(value) => updateSection(activePage, section.id, { backgroundImage: value })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <FieldEditor
                  label={activePage}
                  value={content.pages[activePage]}
                  onChange={(nextValue) => updatePage(activePage, nextValue)}
                />
              </div>
            ) : (
              <FieldEditor
                label={activePanel}
                value={content[activePanel]}
                onChange={(nextValue) => updatePanel(activePanel, nextValue)}
              />
            )}

            <div className="mt-6 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4">
              <button
                type="button"
                className="font-bold text-[var(--deep-navy)]"
                onClick={() => {
                  const nextOpen = !advancedOpen;
                  setAdvancedOpen(nextOpen);
                  if (!advancedOpen) {
                    setContentJson(JSON.stringify(content, null, 2));
                  }
                }}
              >
                {advancedOpen ? 'Hide advanced JSON' : 'Show advanced JSON'}
              </button>
              {advancedOpen && (
                <textarea
                  value={contentJson}
                  onChange={(event) => setContentJson(event.target.value)}
                  spellCheck="false"
                  className="mt-4 min-h-[24rem] w-full rounded-lg border border-[var(--surface-grey)] bg-white p-4 font-mono text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                />
              )}
            </div>
          </div>

          {error && <p className="font-semibold text-red-700">{error}</p>}
          {status && <p className="font-semibold text-[var(--deep-navy)]">{status}</p>}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="submit" className="btn-primary">Save changes</button>
            <button type="button" onClick={handleLocalOnlySave} className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white">
              Save local only
            </button>
            <button type="button" onClick={handleExport} className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white">
              Export backup
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white">
              Import backup
            </button>
            <button type="button" onClick={handleReset} className="btn-secondary !border-[var(--mid-navy)] !text-[var(--deep-navy)] hover:!bg-white">
              Reset to code defaults
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </div>
        </form>
      </div>
    </section>
  );
}
