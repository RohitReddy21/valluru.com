import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  defaultTheme,
  getTheme,
  isAdminUnlocked,
  lockAdmin,
  resetCms,
  saveSiteContent,
  saveTheme,
  unlockAdmin,
} from '../data/cms';
import { defaultSiteContent, siteContent } from '../data/content';

const colorFields = [
  ['deepNavy', 'Deep Navy'],
  ['midNavy', 'Mid Navy'],
  ['gold', 'Gold Accent'],
  ['warmWhite', 'Warm White'],
  ['surfaceGrey', 'Surface Grey'],
  ['mutedBlue', 'Muted Blue'],
];

const panels = [
  ['brand', 'Brand'],
  ['nav', 'Navigation'],
  ['pages', 'Pages'],
];

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

function createArrayItem(label, items) {
  if (label === 'sections') {
    return {
      id: `section-${Date.now()}`,
      type: 'cards',
      eyebrow: 'New Section',
      title: 'New section title',
      body: 'Add section copy here.',
      cards: [{ icon: '01', iconUrl: '', logoUrl: '', title: 'New card', body: 'Add card copy here.', mediaUrl: '', mediaType: 'image' }],
      mediaItems: [],
    };
  }

  if (label === 'cards') return { icon: '01', iconUrl: '', logoUrl: '', title: 'New card', body: 'Add card copy here.', mediaUrl: '', mediaType: 'image' };
  if (label === 'items') return { icon: '01', iconUrl: '', logoUrl: '', title: 'New item', body: 'Add item copy here.', mediaUrl: '', mediaType: 'image' };
  if (label === 'fields') return { label: 'New Field', name: `field${Date.now()}`, type: 'text', placeholder: 'Placeholder text' };
  if (label === 'mediaItems') return { type: 'image', url: '', alt: '', title: '', caption: '' };
  if (label === 'bullets') return 'New bullet';
  if (label === 'proofPoints') return 'New point';

  if (!items.length) return '';
  return createEmptyLike(items[items.length - 1]);
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

function FieldEditor({ label, value, onChange, depth = 0 }) {
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
                </span>
                <button
                  type="button"
                  className="text-sm font-bold text-red-700"
                  onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                >
                  Remove
                </button>
              </div>
              <FieldEditor
                label={primitiveItems ? label : `item-${index + 1}`}
                value={item}
                depth={depth + 1}
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
                onChange={(nextChildValue) => onChange({ ...value, [key]: nextChildValue })}
              />
            </div>
          ))}
        </div>
      </div>
    );
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

function HeroBackgrounds({ pages, onUpdateSection }) {
  const heroSections = Object.entries(pages).flatMap(([pageKey, page]) => (
    (page.sections || [])
      .filter((section) => section.type === 'hero' || section.type === 'page-hero')
      .map((section) => ({ pageKey, pageTitle: page.title || prettyLabel(pageKey), section }))
  ));

  return (
    <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-6 shadow-lg shadow-slate-900/10">
      <h2 className="text-2xl font-bold text-[var(--deep-navy)]">Hero Backgrounds</h2>
      <p className="mt-2 text-sm text-[var(--muted-blue)]">
        Set the hero background image or video for every page from one place. Put files in public and reference them like /hero-tech-bg.png or /hero-background.mp4.
      </p>
      <div className="mt-5 grid gap-4">
        {heroSections.map(({ pageKey, pageTitle, section }) => (
          <div key={`${pageKey}-${section.id}`} className="grid gap-4 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4 lg:grid-cols-[12rem_1fr_1fr]">
            <div>
              <p className="text-sm font-bold text-[var(--deep-navy)]">{pageTitle}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-blue)]">{section.eyebrow || section.id}</p>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--deep-navy)]">Background video path</span>
              <input
                value={section.backgroundVideo || ''}
                onChange={(event) => onUpdateSection(pageKey, section.id, { backgroundVideo: event.target.value })}
                placeholder="/hero-background.mp4"
                className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold text-[var(--deep-navy)]">Fallback image path</span>
              <input
                value={section.backgroundImage || ''}
                onChange={(event) => onUpdateSection(pageKey, section.id, { backgroundImage: event.target.value })}
                placeholder="/hero-tech-bg.png"
                className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
              />
            </label>
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
  const [theme, setTheme] = useState(() => getTheme());
  const [content, setContent] = useState(() => siteContent);
  const [activePanel, setActivePanel] = useState(() => (searchParams.get('page') ? 'pages' : 'brand'));
  const [activePage, setActivePage] = useState(() => searchParams.get('page') || 'home');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [contentJson, setContentJson] = useState(() => JSON.stringify(siteContent, null, 2));
  const fileInputRef = useRef(null);
  const contentSize = useMemo(() => JSON.stringify(content).length.toLocaleString(), [content]);

  const saveCurrentChanges = useCallback(() => {
    const parsedContent = advancedOpen ? JSON.parse(contentJson) : content;
    saveSiteContent(parsedContent);
    saveTheme(theme);
    setStatus('Saved. Open the public pages in this same browser to see the updates.');
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

  function handleSave(event) {
    event.preventDefault();

    try {
      saveCurrentChanges();
      window.location.reload();
    } catch {
      setError('Content JSON is not valid. Fix the JSON before saving.');
    }
  }

  useEffect(() => {
    if (!unlocked) return undefined;

    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        try {
          saveCurrentChanges();
        } catch {
          setError('Content JSON is not valid. Fix the JSON before saving.');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCurrentChanges, unlocked]);

  function handleReset() {
    resetCms();
    setTheme(defaultTheme);
    setContent(defaultSiteContent);
    setContentJson(JSON.stringify(defaultSiteContent, null, 2));
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
        const nextContent = imported.content || imported;
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

  function updateSection(pageKey, sectionId, sectionPatch) {
    const page = content.pages[pageKey];
    const nextSections = page.sections.map((section) => (section.id === sectionId ? { ...section, ...sectionPatch } : section));
    updatePage(pageKey, { ...page, sections: nextSections });
  }

  const heroSections = content.pages[activePage]?.sections?.filter((section) => section.type === 'hero' || section.type === 'page-hero') || [];

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
              Browser-only admin gate. Use a backend later if this must securely update the public live site for everyone.
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
            This is a no-service admin editor. It stores your changes in browser storage and includes export/import backup.
            A static website cannot securely update every visitor's live content without some backend or hosted storage.
          </p>
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
                    <h3 className="text-lg font-bold text-[var(--deep-navy)]">Hero background for {content.pages[activePage]?.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted-blue)]">
                      Put background files in public, then reference them as /hero-video.mp4 or /hero-image.png.
                    </p>
                    <div className="mt-5 grid gap-5">
                      {heroSections.map((section) => (
                        <div key={section.id} className="grid gap-4 rounded-xl border border-[var(--surface-grey)] bg-[var(--warm-white)] p-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <p className="text-sm font-bold text-[var(--deep-navy)]">{section.eyebrow || section.title}</p>
                          </div>
                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-[var(--deep-navy)]">Background video path</span>
                            <input
                              value={section.backgroundVideo || ''}
                              onChange={(event) => updateSection(activePage, section.id, { backgroundVideo: event.target.value })}
                              placeholder="/hero-background.mp4"
                              className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                            />
                          </label>
                          <label className="grid gap-2">
                            <span className="text-sm font-bold text-[var(--deep-navy)]">Fallback background image path</span>
                            <input
                              value={section.backgroundImage || ''}
                              onChange={(event) => updateSection(activePage, section.id, { backgroundImage: event.target.value })}
                              placeholder="/hero-tech-bg.png"
                              className="rounded-lg border border-[var(--surface-grey)] bg-white px-4 py-3 text-sm text-[var(--deep-navy)] outline-none focus:border-[var(--gold)]"
                            />
                          </label>
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
