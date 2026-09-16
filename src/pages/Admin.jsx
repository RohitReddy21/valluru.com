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
import { EditorGroup, FieldEditor, SectionEditor, Switch, TextField } from '../components/admin/AdminFields';
import { Icon } from '../components/admin/AdminIcons';
import {
  createArrayItem,
  isPlainObject,
  pagePath,
  prettyLabel,
  sectionTypeInfo,
} from '../components/admin/fieldUtils';
import BlogManager from '../components/admin/BlogManager';
import DesignPanel from '../components/admin/DesignPanel';
import ResourceManager from '../components/admin/ResourceManager';

const panes = [
  {
    group: 'Content',
    items: [
      { key: 'overview', label: 'Overview', icon: 'grid' },
      { key: 'pages', label: 'Pages', icon: 'file' },
      { key: 'resources', label: 'Resources', icon: 'linkedin' },
      { key: 'blogs', label: 'Insights blog', icon: 'edit' },
    ],
  },
  {
    group: 'Site',
    items: [
      { key: 'brand', label: 'Brand', icon: 'tag' },
      { key: 'design', label: 'Design & colors', icon: 'droplet' },
    ],
  },
  {
    group: 'Data',
    items: [{ key: 'backup', label: 'Backup & JSON', icon: 'database' }],
  },
];

const allPanes = panes.flatMap((group) => group.items);

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
    .map(([key, value]) => ({ label: prettyLabel(key), value: String(value) }));

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
  const nextSection = { hidden: false, layout: section.layout || 'default', ...section };

  if (nextSection.cards) nextSection.cards = normalizeArrayVisibility(nextSection.cards);
  if (nextSection.items) {
    nextSection.items = normalizeArrayVisibility(nextSection.items).map((item) => (
      nextSection.type === 'detail-cards' ? normalizeDetailCardItem(item) : item
    ));
  }
  if (nextSection.fields) nextSection.fields = normalizeArrayVisibility(nextSection.fields);
  if (nextSection.mediaItems) nextSection.mediaItems = normalizeArrayVisibility(nextSection.mediaItems);

  return nextSection;
}

function normalizeEditableContent(value) {
  if (!value?.pages) return value;

  // Live content saved before a page existed in code would otherwise hide that
  // page from the editor forever, so backfill anything missing from defaults.
  const mergedPages = { ...defaultSiteContent.pages, ...value.pages };

  return {
    ...value,
    pages: Object.fromEntries(
      Object.entries(mergedPages).map(([pageKey, page]) => [
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

function sectionName(section) {
  return section.eyebrow || section.title || sectionTypeInfo(section.type).name;
}

function sectionSummary(section) {
  if (section.type === 'contact-form') return `${section.fields?.length || 0} fields`;
  if (section.cards?.length) return `${section.cards.length} cards`;
  if (section.items?.length) return `${section.items.length} detail cards`;
  if (section.bullets?.length) return `${section.bullets.length} bullets`;
  if (section.proofPoints?.length) return `${section.proofPoints.length} points`;
  return '';
}

function UnlockScreen({ password, setPassword, onSubmit, error }) {
  return (
    <section className="admin-unlock">
      <form onSubmit={onSubmit} className="admin-unlock-card">
        <span className="admin-unlock-icon">
          <Icon name="lock" size={22} />
        </span>
        <h1 className="admin-page-title mt-4">Welcome back</h1>
        <p className="admin-page-sub">Unlock the editor to update your site.</p>
        <label className="admin-field mt-6">
          <span className="admin-label">Admin password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="admin-input"
            placeholder="Enter password"
            autoFocus
          />
        </label>
        {error && (
          <div className="admin-banner mt-4">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}
        <button type="submit" className="admin-btn admin-btn-primary admin-btn-lg mt-5 w-full">
          Unlock editor
        </button>
        <p className="admin-hint-sm mt-4 text-center">Uses the ADMIN_PASSWORD set in Vercel.</p>
      </form>
    </section>
  );
}

function Toasts({ toasts, onDismiss }) {
  return (
    <div className="admin-toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast${toast.tone === 'error' ? ' is-error' : ''}`}>
          <span className="admin-toast-icon">
            <Icon name={toast.tone === 'error' ? 'x' : 'check'} size={13} />
          </span>
          <span className="min-w-0 flex-1">{toast.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => onDismiss(toast.id)}>
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const [theme, setTheme] = useState(() => getTheme());
  const [content, setContent] = useState(() => normalizeEditableContent(siteContent));
  const [activePane, setActivePane] = useState(() => (searchParams.get('page') ? 'pages' : 'overview'));
  const [activePage, setActivePage] = useState(() => searchParams.get('page') || 'home');
  const [activeSectionId, setActiveSectionId] = useState(() => searchParams.get('section') || '');
  const [isDirty, setIsDirty] = useState(false);
  const [resourceCount, setResourceCount] = useState(null);
  const [useJsonSource, setUseJsonSource] = useState(false);
  const [contentJson, setContentJson] = useState(() => JSON.stringify(normalizeEditableContent(siteContent), null, 2));
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);
  const paneRef = useRef(null);
  const saveRef = useRef(null);

  const adminPassword = getAdminPassword();
  const pages = content.pages || {};
  const currentPage = pages[activePage];
  const sections = currentPage?.sections || [];
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];

  const stats = useMemo(() => {
    const allPages = content.pages || {};
    return {
      pages: Object.keys(allPages).length,
      sections: Object.values(allPages).reduce((total, page) => total + (page.sections?.length || 0), 0),
      blogs: allPages.insights?.blogs?.length || 0,
      size: `${Math.round(JSON.stringify(content).length / 1024)} KB`,
    };
  }, [content]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, tone = 'ok') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current.slice(-3), { id, message, tone }]);
    window.setTimeout(() => dismissToast(id), tone === 'error' ? 9000 : 3500);
  }, [dismissToast]);

  function applyContent(nextContent) {
    setContent(nextContent);
    setContentJson(JSON.stringify(nextContent, null, 2));
    setIsDirty(true);
  }

  function goToPane(key) {
    setActivePane(key);
    paneRef.current?.scrollTo({ top: 0 });
  }

  async function handleSave() {
    if (isSaving) return;

    let parsedContent = content;
    if (useJsonSource) {
      try {
        parsedContent = JSON.parse(contentJson);
      } catch {
        notify('The advanced JSON is not valid. Fix it or turn off "Save from JSON".', 'error');
        return;
      }
    }

    if (!adminPassword) {
      notify('Your admin session expired. Lock the editor and unlock it again.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      await saveLiveCms({ content: parsedContent, theme, adminPassword });
      saveSiteContent(parsedContent);
      saveTheme(theme);
      setIsDirty(false);
      notify('Saved. Your changes are live.');
    } catch (error) {
      notify(`${error.message || 'Live save failed.'} Nothing was published.`, 'error');
    } finally {
      setIsSaving(false);
    }
  }

  function handleLocalOnlySave() {
    try {
      const parsedContent = useJsonSource ? JSON.parse(contentJson) : content;
      saveSiteContent(parsedContent);
      saveTheme(theme);
      setIsDirty(false);
      notify('Saved in this browser only. The live site was not updated.');
    } catch {
      notify('The advanced JSON is not valid.', 'error');
    }
  }

  async function handleCheckLiveStorage() {
    setLiveStatus({ tone: 'info', message: 'Checking live storage…' });
    const result = await checkLiveCms();

    if (!result.ok) {
      setLiveStatus({ tone: 'error', message: `Not reachable: ${result.error}` });
    } else if (result.data?.configured === false) {
      setLiveStatus({ tone: 'error', message: `Not configured: ${result.data.error}` });
    } else if (result.data?.updatedAt) {
      setLiveStatus({ tone: 'ok', message: `Working · last published ${new Date(result.data.updatedAt).toLocaleString()}` });
    } else {
      setLiveStatus({ tone: 'info', message: 'Reachable, but nothing has been published yet.' });
    }
  }

  useEffect(() => {
    saveRef.current = handleSave;
  });

  // Ctrl+S saves the site. The Resources tab handles its own shortcut.
  useEffect(() => {
    if (!unlocked || activePane === 'resources') return undefined;

    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveRef.current?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unlocked, activePane]);

  useEffect(() => {
    if (!isDirty) return undefined;

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  function handleUnlock(event) {
    event.preventDefault();
    if (unlockAdmin(password)) {
      setUnlocked(true);
      setUnlockError('');
      return;
    }

    setUnlockError('Enter the admin password.');
  }

  function handleReset() {
    if (!window.confirm('Reset all content and colors back to the code defaults? Unsaved work will be lost.')) return;

    resetCms();
    setTheme(defaultTheme);
    setContent(normalizeEditableContent(defaultSiteContent));
    setContentJson(JSON.stringify(normalizeEditableContent(defaultSiteContent), null, 2));
    window.location.reload();
  }

  function handleExport() {
    const backup = { exportedAt: new Date().toISOString(), theme, content };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thevalluru-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Backup downloaded.');
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        applyContent(normalizeEditableContent(imported.content || imported));
        if (imported.theme) setTheme(imported.theme);
        notify('Backup loaded. Review it, then click Save site.');
      } catch {
        notify('That file is not valid JSON.', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function updatePanel(panel, value) {
    applyContent({ ...content, [panel]: value });
  }

  function updatePage(pageKey, value) {
    applyContent({ ...content, pages: { ...content.pages, [pageKey]: value } });
  }

  function updateSection(pageKey, sectionId, sectionPatch) {
    const page = content.pages[pageKey];
    const nextSections = page.sections.map((section) => (
      section.id === sectionId ? { ...section, ...sectionPatch } : section
    ));
    updatePage(pageKey, { ...page, sections: nextSections });
  }

  function replaceSection(sectionId, nextSection) {
    const nextSections = sections.map((section) => (section.id === sectionId ? nextSection : section));
    updatePage(activePage, { ...currentPage, sections: nextSections });
  }

  function selectPage(pageKey) {
    setActivePage(pageKey);
    setActiveSectionId(pages[pageKey]?.sections?.[0]?.id || '');
  }

  function openSection(pageKey, sectionId) {
    goToPane('pages');
    setActivePage(pageKey);
    setActiveSectionId(sectionId || pages[pageKey]?.sections?.[0]?.id || '');
  }

  function addSection() {
    const nextSection = createArrayItem('sections', sections);
    updatePage(activePage, { ...currentPage, sections: [...sections, nextSection] });
    setActiveSectionId(nextSection.id);
  }

  function removeSection(sectionId) {
    if (!window.confirm('Remove this section from the page?')) return;
    const nextSections = sections.filter((section) => section.id !== sectionId);
    updatePage(activePage, { ...currentPage, sections: nextSections });
    setActiveSectionId(nextSections[0]?.id || '');
  }

  function moveSection(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;

    const nextSections = [...sections];
    const [moved] = nextSections.splice(index, 1);
    nextSections.splice(target, 0, moved);
    updatePage(activePage, { ...currentPage, sections: nextSections });
  }

  if (!unlocked) {
    return <UnlockScreen password={password} setPassword={setPassword} onSubmit={handleUnlock} error={unlockError} />;
  }

  const paneCounts = { pages: stats.pages, resources: resourceCount, blogs: stats.blogs };
  const activePaneInfo = allPanes.find((item) => item.key === activePane);
  const homeHero = pages.home?.sections?.find((section) => section.type === 'hero');

  return (
    <div className="admin-app">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-crumbs">
            <span>Admin</span>
            <Icon name="chevronRight" size={14} />
            <strong>{activePaneInfo?.label}</strong>
            {activePane === 'pages' && currentPage && (
              <>
                <Icon name="chevronRight" size={14} />
                <strong>{currentPage.title || prettyLabel(activePage)}</strong>
              </>
            )}
          </div>

          {activePane !== 'resources' && (
            <span className={`admin-save-state${isDirty ? ' is-dirty' : ''}`}>
              <span className="admin-save-dot"></span>
              {isDirty ? 'Unsaved changes' : 'All changes saved'}
            </span>
          )}

          <a href={activePane === 'pages' ? pagePath(activePage) : '/'} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost">
            <Icon name="external" size={15} />
            <span className="admin-hide-sm">View site</span>
          </a>
          {activePane !== 'resources' && (
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSave} disabled={isSaving}>
              <Icon name="save" size={15} />
              {isSaving ? 'Saving…' : 'Save site'}
            </button>
          )}
        </div>
      </header>

      <div className="admin-shell">
        <nav className="admin-rail" aria-label="Admin sections">
          <div className="admin-rail-brand">
            <span className="admin-rail-logo">SV</span>
            <span className="min-w-0">
              <strong>Site editor</strong>
              <span>TheValluru.com</span>
            </span>
          </div>

          {panes.map((group) => (
            <div key={group.group} className="admin-rail-section">
              <p className="admin-rail-group">{group.group}</p>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goToPane(item.key)}
                  className={`admin-rail-item${activePane === item.key ? ' is-active' : ''}`}
                  aria-current={activePane === item.key ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.label}</span>
                  {paneCounts[item.key] !== undefined && paneCounts[item.key] !== null && (
                    <span className="admin-rail-count">{paneCounts[item.key]}</span>
                  )}
                </button>
              ))}
            </div>
          ))}

          <button
            type="button"
            className="admin-rail-item admin-rail-lock"
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Lock the editor anyway?')) return;
              lockAdmin();
              setUnlocked(false);
            }}
          >
            <Icon name="lock" size={17} />
            <span>Lock editor</span>
          </button>
        </nav>

        <main className="admin-pane" ref={paneRef}>
          {activePane === 'overview' && (
            <div className="admin-pane-inner">
              <div className="admin-welcome">
                <div>
                  <p className="admin-welcome-eyebrow">Site editor</p>
                  <h1 className="admin-welcome-title">What would you like to update?</h1>
                  <p className="admin-welcome-sub">
                    Edit page words, add LinkedIn posts, or adjust colors. Press Ctrl+S to save from anywhere.
                  </p>
                </div>
              </div>

              <div className="admin-stats">
                {[
                  { label: 'Pages', value: stats.pages, icon: 'file', tint: '#0a66c2' },
                  { label: 'Sections', value: stats.sections, icon: 'layers', tint: '#7c3aed' },
                  { label: 'Resources', value: resourceCount ?? '—', icon: 'linkedin', tint: '#0891b2' },
                  { label: 'Blog posts', value: stats.blogs, icon: 'edit', tint: '#059669' },
                ].map((stat) => (
                  <div key={stat.label} className="admin-stat" style={{ '--tint': stat.tint }}>
                    <span className="admin-stat-icon">
                      <Icon name={stat.icon} size={20} />
                    </span>
                    <span>
                      <span className="admin-stat-value">{stat.value}</span>
                      <span className="admin-stat-label">{stat.label}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="admin-section-heading">Quick actions</h2>
                <div className="admin-actions-grid">
                  <button type="button" className="admin-action-tile" onClick={() => goToPane('resources')}>
                    <span className="admin-stat-icon" style={{ '--tint': '#0a66c2' }}><Icon name="linkedin" size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="admin-item-title">Add a LinkedIn post</span>
                      <span className="admin-item-snippet">Paste a link and publish to /resources</span>
                    </span>
                    <Icon name="chevronRight" size={16} className="admin-item-chevron" />
                  </button>
                  {homeHero && (
                    <button type="button" className="admin-action-tile" onClick={() => openSection('home', homeHero.id)}>
                      <span className="admin-stat-icon" style={{ '--tint': '#7c3aed' }}><Icon name="edit" size={20} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="admin-item-title">Edit the home headline</span>
                        <span className="admin-item-snippet">Title, intro text and main button</span>
                      </span>
                      <Icon name="chevronRight" size={16} className="admin-item-chevron" />
                    </button>
                  )}
                  <button type="button" className="admin-action-tile" onClick={() => goToPane('design')}>
                    <span className="admin-stat-icon" style={{ '--tint': '#d97706' }}><Icon name="droplet" size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="admin-item-title">Change colors</span>
                      <span className="admin-item-snippet">Accent, text and backgrounds</span>
                    </span>
                    <Icon name="chevronRight" size={16} className="admin-item-chevron" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="admin-section-heading">Pages</h2>
                <div className="admin-page-grid">
                  {Object.entries(pages).map(([pageKey, page]) => (
                    <button key={pageKey} type="button" className="admin-page-card" onClick={() => openSection(pageKey)}>
                      <span className="admin-page-card-top">
                        <Icon name="file" size={18} />
                        <span className="admin-pill">{page.sections?.length || 0} {page.sections?.length === 1 ? 'section' : 'sections'}</span>
                      </span>
                      <span className="admin-item-title mt-3">{page.title || prettyLabel(pageKey)}</span>
                      <span className="admin-item-snippet">{pagePath(pageKey)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <EditorGroup title="Live sync" icon="refresh" hint="Confirm that saved changes reach other browsers.">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="admin-btn" onClick={handleCheckLiveStorage}>Check live storage</button>
                  {liveStatus && (
                    <span className={`admin-banner ${liveStatus.tone === 'ok' ? 'is-ok' : liveStatus.tone === 'error' ? '' : 'is-info'}`}>
                      {liveStatus.message}
                    </span>
                  )}
                </div>
              </EditorGroup>
            </div>
          )}

          {activePane === 'pages' && (
            <div className="admin-pane-inner">
              <div className="admin-chips" role="tablist" aria-label="Pages">
                {Object.entries(pages).map(([pageKey, page]) => (
                  <button
                    key={pageKey}
                    type="button"
                    role="tab"
                    aria-selected={activePage === pageKey}
                    className={`admin-chip${activePage === pageKey ? ' is-active' : ''}`}
                    onClick={() => selectPage(pageKey)}
                  >
                    {page.title || prettyLabel(pageKey)}
                    <span className="admin-chip-count">{page.sections?.length || 0}</span>
                  </button>
                ))}
              </div>

              <div className="admin-columns">
                <div className="admin-list">
                  <p className="admin-list-heading">Sections</p>
                  {sections.map((section, index) => {
                    const typeInfo = sectionTypeInfo(section.type);
                    const summary = sectionSummary(section);

                    return (
                      <div
                        key={section.id}
                        className={`admin-row admin-nav-row${activeSection?.id === section.id ? ' is-active' : ''}${section.hidden ? ' is-hidden' : ''}`}
                      >
                        <button type="button" className="admin-row-main" onClick={() => setActiveSectionId(section.id)}>
                          <span className="admin-type-dot" style={{ '--dot': typeInfo.color }}></span>
                          <span className="min-w-0 flex-1">
                            <span className="admin-item-title">{sectionName(section)}</span>
                            <span className="admin-item-snippet">
                              {section.hidden ? 'Hidden · ' : ''}
                              {typeInfo.name}
                              {summary ? ` · ${summary}` : ''}
                            </span>
                          </span>
                        </button>
                        <div className="admin-row-actions">
                          <button type="button" className="admin-icon-btn" title="Move up" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                            <Icon name="chevronUp" size={15} />
                          </button>
                          <button type="button" className="admin-icon-btn" title="Move down" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)}>
                            <Icon name="chevronDown" size={15} />
                          </button>
                          <button type="button" className="admin-icon-btn is-danger" title="Remove section" onClick={() => removeSection(section.id)}>
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button type="button" className="admin-add-dashed mt-1" onClick={addSection}>
                    <Icon name="plus" size={14} />
                    Add section
                  </button>
                </div>

                {!activeSection ? (
                  <div className="admin-empty">
                    <Icon name="layers" size={28} />
                    <p>This page has no sections yet.</p>
                    <button type="button" className="admin-btn admin-btn-primary" onClick={addSection}>Add a section</button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="admin-editor-bar">
                      <div className="min-w-0">
                        <span className="admin-type-badge" style={{ '--badge': sectionTypeInfo(activeSection.type).color }}>
                          {sectionTypeInfo(activeSection.type).name}
                        </span>
                        <h2 className="admin-editor-title">{sectionName(activeSection)}</h2>
                      </div>
                      <label className="admin-inline-switch">
                        <Icon name={activeSection.hidden ? 'eyeOff' : 'eye'} size={15} />
                        <span>{activeSection.hidden ? 'Hidden on site' : 'Visible on site'}</span>
                        <Switch
                          checked={!activeSection.hidden}
                          label="Visible on site"
                          onChange={(visible) => updateSection(activePage, activeSection.id, { hidden: !visible })}
                        />
                      </label>
                    </div>

                    <SectionEditor
                      key={`${activePage}-${activeSection.id}`}
                      section={activeSection}
                      onChange={(nextSection) => replaceSection(activeSection.id, nextSection)}
                    />

                    <EditorGroup title="Page settings" icon="file" hint={`Settings for the whole ${currentPage?.title || activePage} page.`} collapsible defaultOpen={false}>
                      <TextField
                        label="title"
                        displayLabel="Page name"
                        hint="Shown in this editor and used as a fallback title."
                        value={currentPage?.title}
                        onChange={(value) => updatePage(activePage, { ...currentPage, title: value })}
                      />
                    </EditorGroup>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePane === 'resources' && (
            <ResourceManager adminPassword={adminPassword} onCountChange={setResourceCount} notify={notify} />
          )}

          {activePane === 'blogs' && (
            <BlogManager
              blogs={content.pages?.insights?.blogs || []}
              onChange={(blogs) => updatePage('insights', { ...content.pages.insights, blogs })}
            />
          )}

          {activePane === 'brand' && (
            <div className="admin-pane-inner">
              <div className="admin-page-head">
                <div>
                  <h1 className="admin-page-title">Brand</h1>
                  <p className="admin-page-sub">Your name, taglines and links used in the header and footer.</p>
                </div>
              </div>
              <EditorGroup title="Identity & links" icon="tag">
                <FieldEditor label="brand" value={content.brand} onChange={(value) => updatePanel('brand', value)} />
              </EditorGroup>
              <EditorGroup
                title="Navigation list"
                icon="layers"
                hint="Stored for reference. The site header links are currently fixed in code, so edits here do not change the header."
                collapsible
                defaultOpen={false}
              >
                <FieldEditor label="nav" value={content.nav} onChange={(value) => updatePanel('nav', value)} />
              </EditorGroup>
            </div>
          )}

          {activePane === 'design' && (
            <DesignPanel
              theme={theme}
              onThemeChange={(nextTheme) => {
                setTheme(nextTheme);
                setIsDirty(true);
              }}
              pages={pages}
              onUpdateSection={updateSection}
            />
          )}

          {activePane === 'backup' && (
            <div className="admin-pane-inner">
              <div className="admin-page-head">
                <div>
                  <h1 className="admin-page-title">Backup & JSON</h1>
                  <p className="admin-page-sub">Download a copy before big edits. Resources are stored separately in Supabase.</p>
                </div>
              </div>

              <div className="admin-actions-grid">
                <button type="button" className="admin-action-tile" onClick={handleExport}>
                  <span className="admin-stat-icon" style={{ '--tint': '#0a66c2' }}><Icon name="download" size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="admin-item-title">Download backup</span>
                    <span className="admin-item-snippet">Pages, blog, colors · {stats.size}</span>
                  </span>
                </button>
                <button type="button" className="admin-action-tile" onClick={() => fileInputRef.current?.click()}>
                  <span className="admin-stat-icon" style={{ '--tint': '#059669' }}><Icon name="upload" size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="admin-item-title">Restore from backup</span>
                    <span className="admin-item-snippet">Loads a file — review, then Save site</span>
                  </span>
                </button>
                <button type="button" className="admin-action-tile" onClick={handleLocalOnlySave}>
                  <span className="admin-stat-icon" style={{ '--tint': '#64748b' }}><Icon name="save" size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="admin-item-title">Save in this browser only</span>
                    <span className="admin-item-snippet">For testing — not published</span>
                  </span>
                </button>
                <button type="button" className="admin-action-tile is-danger" onClick={handleReset}>
                  <span className="admin-stat-icon" style={{ '--tint': '#dc2626' }}><Icon name="refresh" size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="admin-item-title">Reset to code defaults</span>
                    <span className="admin-item-snippet">Discards edits in this browser</span>
                  </span>
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
              </div>

              <EditorGroup
                title="Advanced JSON"
                icon="database"
                hint="For bulk edits. While “Save from JSON” is on, Save site uses this text instead of the visual editor."
                collapsible
                defaultOpen={useJsonSource}
                actions={(
                  <label className="admin-inline-switch">
                    <span>Save from JSON</span>
                    <Switch
                      checked={useJsonSource}
                      label="Save from JSON"
                      onChange={(checked) => {
                        setUseJsonSource(checked);
                        if (checked) setContentJson(JSON.stringify(content, null, 2));
                      }}
                    />
                  </label>
                )}
              >
                <textarea
                  value={contentJson}
                  onChange={(event) => {
                    setContentJson(event.target.value);
                    setIsDirty(true);
                  }}
                  spellCheck="false"
                  className="admin-textarea admin-input-mono min-h-[28rem] text-xs"
                />
              </EditorGroup>
            </div>
          )}
        </main>
      </div>

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
