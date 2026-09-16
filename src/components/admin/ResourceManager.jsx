import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ResourceCard from '../ResourceCard';
import { AutoTextarea, EditorGroup, MediaUploadField, SegmentedField, SelectField, TextField, ToggleField } from './AdminFields';
import { Icon } from './AdminIcons';
import { moveArrayItem } from './fieldUtils';
import {
  createEmptyResource,
  createResource,
  deleteResource,
  fromUnicodeBold,
  loadAllResources,
  reorderResources,
  resourceCategories,
  toLinkedInEmbedUrl,
  updateResource,
} from '../../data/resources';

const statusOptions = [
  ['draft', 'Draft'],
  ['published', 'Published'],
];

const filterOptions = [
  ['all', 'All'],
  ['published', 'Live'],
  ['draft', 'Drafts'],
];

const categoryOptions = resourceCategories.map((category) => [category, category]);

function TagInput({ tags, onChange }) {
  const [draft, setDraft] = useState('');

  function commit() {
    const tag = draft.trim().replace(/^#/, '').replace(/,$/, '');
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft('');
  }

  return (
    <div className="admin-field">
      <span className="admin-label">Tags</span>
      <div className="admin-tags">
        {tags.map((tag) => (
          <span key={tag} className="admin-tag">
            #{tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(tags.filter((item) => item !== tag))}>
              <Icon name="x" size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit();
            } else if (event.key === 'Backspace' && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={tags.length ? 'Add another…' : 'Type a tag and press Enter'}
        />
      </div>
    </div>
  );
}

function ResourceThumb({ resource }) {
  if (resource.image_url) {
    return (
      <span className="admin-res-thumb">
        <img src={resource.image_url} alt="" />
      </span>
    );
  }

  if (resource.embed_url || resource.category === 'LinkedIn Post') {
    return (
      <span className="admin-res-thumb is-linkedin">
        <Icon name="linkedin" size={16} />
      </span>
    );
  }

  return (
    <span className="admin-res-thumb">
      <Icon name="file" size={16} />
    </span>
  );
}

export default function ResourceManager({ adminPassword, onCountChange, notify }) {
  const [resources, setResources] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [quickUrl, setQuickUrl] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('edit');
  const saveRef = useRef(null);

  // Handlers ask for a reload by bumping the token; the effect owns the fetch.
  const refresh = useCallback(() => {
    setIsLoading(true);
    setLoadError('');
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await loadAllResources(adminPassword);
        if (cancelled) return;
        setResources(rows);
        onCountChange?.(rows.length);
        setActiveId((current) => (rows.some((row) => row.id === current) ? current : rows[0]?.id || ''));
      } catch (error) {
        if (!cancelled) setLoadError(error.message || 'Could not load resources.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [adminPassword, reloadToken, onCountChange]);

  const activeResource = useMemo(
    () => draft || resources.find((resource) => resource.id === activeId) || null,
    [draft, resources, activeId],
  );

  const visibleResources = resources.filter((resource) => filter === 'all' || resource.status === filter);
  const liveCount = resources.filter((resource) => resource.status === 'published').length;
  const isDirty = Boolean(draft);
  const derivedEmbed = activeResource ? toLinkedInEmbedUrl(activeResource.embed_url || activeResource.post_url) : '';

  function confirmDiscard() {
    return !isDirty || window.confirm('Discard your unsaved changes to this resource?');
  }

  function patchActive(patch) {
    setDraft((current) => ({ ...(current || activeResource), ...patch }));
  }

  function selectResource(id) {
    if (id === activeId && (!draft || draft.id === id)) return;
    if (!confirmDiscard()) return;
    setDraft(null);
    setActiveId(id);
  }

  function startNewResource(postUrl = '') {
    if (!confirmDiscard()) return;
    setDraft({
      ...createEmptyResource(),
      post_url: postUrl,
      embed_url: toLinkedInEmbedUrl(postUrl),
      sort_order: resources.length,
    });
    setActiveId('');
    setView('edit');
  }

  function handleQuickAdd(event) {
    event.preventDefault();
    const url = quickUrl.trim();
    if (!url) return;
    startNewResource(url);
    setQuickUrl('');
  }

  async function handleSave(publish) {
    if (!activeResource || isSaving) return;

    const nextStatus = publish ? 'published' : activeResource.status;
    const payload = {
      ...activeResource,
      status: nextStatus,
      embed_url: derivedEmbed,
      body: fromUnicodeBold(activeResource.body),
    };

    if (!payload.title.trim() && !payload.embed_url) {
      notify('Add a title, or a LinkedIn link that can be embedded, before saving.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const saved = payload.id
        ? await updateResource(payload, adminPassword)
        : await createResource(payload, adminPassword);

      setDraft(null);
      setActiveId(saved.id);
      notify(saved.status === 'published' ? 'Saved and live on /resources.' : 'Draft saved.');
      refresh();
    } catch (error) {
      notify(error.message || 'Could not save this resource.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    saveRef.current = () => {
      if (draft) handleSave(false);
    };
  });

  // Ctrl+S saves the open resource while this tab is showing.
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveRef.current?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleDelete() {
    if (!activeResource?.id) {
      setDraft(null);
      return;
    }

    if (!window.confirm(`Delete "${activeResource.title || 'this resource'}" permanently? This cannot be undone.`)) return;

    setIsSaving(true);

    try {
      await deleteResource(activeResource.id, adminPassword);
      setDraft(null);
      notify('Resource deleted.');
      refresh();
    } catch (error) {
      notify(error.message || 'Could not delete this resource.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function move(resourceId, direction) {
    const index = resources.findIndex((resource) => resource.id === resourceId);
    const reordered = moveArrayItem(resources, index, index + direction);
    if (reordered === resources) return;

    setResources(reordered);

    try {
      await reorderResources(reordered.map((resource) => resource.id), adminPassword);
    } catch (error) {
      notify(error.message || 'Could not save the new order.', 'error');
      refresh();
    }
  }

  return (
    <div className="admin-pane-inner">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Resources</h1>
          <p className="admin-page-sub">
            LinkedIn posts and articles, saved to Supabase. Published items show on /resources straight away.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="admin-pill">{liveCount} live</span>
          <span className="admin-pill">{resources.length - liveCount} drafts</span>
          <button type="button" className="admin-icon-btn" title="Reload from Supabase" onClick={refresh} disabled={isLoading}>
            <Icon name="refresh" size={16} />
          </button>
        </div>
      </div>

      <form className="admin-quick-add" onSubmit={handleQuickAdd}>
        <span className="admin-quick-add-icon">
          <Icon name="linkedin" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor="quick-linkedin" className="admin-label">Add a LinkedIn post</label>
          <input
            id="quick-linkedin"
            value={quickUrl}
            onChange={(event) => setQuickUrl(event.target.value)}
            placeholder="Paste the post link or its embed link…"
            className="admin-input mt-1.5"
          />
        </div>
        <div className="flex gap-2 self-end">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={!quickUrl.trim()}>
            <Icon name="plus" size={16} />
            Add post
          </button>
          <button type="button" className="admin-btn" onClick={() => startNewResource()}>
            Blank
          </button>
        </div>
      </form>

      {loadError && (
        <div className="admin-banner">
          <Icon name="alert" size={18} />
          <span>{loadError}</span>
        </div>
      )}

      <div className="admin-columns">
        <div className="admin-list">
          <SegmentedField value={filter} options={filterOptions} onChange={setFilter} />

          {isLoading && <p className="admin-empty-note">Loading resources…</p>}

          {!isLoading && visibleResources.length === 0 && !draft && (
            <p className="admin-empty-note">
              {resources.length === 0 ? 'No resources yet. Paste a LinkedIn link above to add your first post.' : 'Nothing in this filter.'}
            </p>
          )}

          {draft && !draft.id && (
            <div className="admin-row admin-nav-row is-active">
              <div className="admin-row-main">
                <ResourceThumb resource={draft} />
                <span className="min-w-0 flex-1">
                  <span className="admin-item-title">{draft.title || 'New resource'}</span>
                  <span className="admin-item-snippet">Not saved yet</span>
                </span>
              </div>
            </div>
          )}

          {visibleResources.map((resource) => {
            const index = resources.indexOf(resource);

            return (
              <div key={resource.id} className={`admin-row admin-nav-row${activeId === resource.id && !(draft && !draft.id) ? ' is-active' : ''}`}>
                <button type="button" className="admin-row-main" onClick={() => selectResource(resource.id)}>
                  <ResourceThumb resource={resource} />
                  <span className="min-w-0 flex-1">
                    <span className="admin-item-title">{resource.title || 'Untitled resource'}</span>
                    <span className="admin-item-snippet">
                      <span className={`admin-status-dot${resource.status === 'published' ? ' is-live' : ''}`}></span>
                      {resource.status === 'published' ? 'Live' : 'Draft'}
                      {resource.featured ? ' · Featured' : ''}
                      {resource.published_at ? ` · ${resource.published_at}` : ''}
                    </span>
                  </span>
                </button>
                {filter === 'all' && (
                  <div className="admin-row-actions">
                    <button type="button" className="admin-icon-btn" title="Move up" disabled={index === 0} onClick={() => move(resource.id, -1)}>
                      <Icon name="chevronUp" size={15} />
                    </button>
                    <button type="button" className="admin-icon-btn" title="Move down" disabled={index === resources.length - 1} onClick={() => move(resource.id, 1)}>
                      <Icon name="chevronDown" size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!activeResource ? (
          <div className="admin-empty">
            <Icon name="linkedin" size={30} />
            <p>Paste a LinkedIn link above, or pick a resource on the left.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="admin-editor-bar">
              <div className="min-w-0">
                <span className="admin-type-badge" style={{ '--badge': activeResource.status === 'published' ? '#16a34a' : '#64748b' }}>
                  {activeResource.id ? (activeResource.status === 'published' ? 'Live' : 'Draft') : 'New'}
                  {isDirty && ' · unsaved'}
                </span>
                <h2 className="admin-editor-title">{activeResource.title || 'Untitled resource'}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="admin-view-toggle">
                  <SegmentedField value={view} options={[['edit', 'Edit'], ['preview', 'Preview']]} onChange={setView} />
                </div>
                <button type="button" className="admin-icon-btn is-danger" title="Delete resource" onClick={handleDelete} disabled={isSaving}>
                  <Icon name="trash" size={16} />
                </button>
                {activeResource.status !== 'published' && (
                  <button type="button" className="admin-btn" onClick={() => handleSave(false)} disabled={isSaving}>
                    Save draft
                  </button>
                )}
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleSave(true)}
                  disabled={isSaving || (activeResource.status === 'published' && !isDirty)}
                >
                  <Icon name={activeResource.status === 'published' ? 'save' : 'sparkle'} size={16} />
                  {isSaving ? 'Saving…' : activeResource.status === 'published' ? 'Update' : 'Publish'}
                </button>
              </div>
            </div>

            <div className="admin-split" data-view={view}>
              <div className="admin-split-form grid gap-4">
                <EditorGroup title="LinkedIn link" icon="linkedin">
                  <TextField
                    label="post_url"
                    displayLabel="Post link"
                    placeholder="https://www.linkedin.com/posts/…"
                    hint="Used for the “View on LinkedIn” button."
                    value={activeResource.post_url}
                    onChange={(value) => patchActive({ post_url: value })}
                  />
                  <TextField
                    label="embed_url"
                    displayLabel="Embed link (optional)"
                    placeholder="https://www.linkedin.com/embed/feed/update/urn:li:share:…"
                    hint="On LinkedIn: ••• on the post → Embed this post → copy the link inside src=&quot;…&quot;."
                    value={activeResource.embed_url}
                    onChange={(value) => patchActive({ embed_url: value })}
                  />
                  <div className={`admin-banner ${activeResource.body.trim() ? 'is-ok' : 'is-info'}`}>
                    <Icon name={activeResource.body.trim() ? 'check' : 'alert'} size={16} />
                    <span>
                      {activeResource.body.trim()
                        ? 'The card links to its own page with the full post text and a “View on LinkedIn” button.'
                        : 'Paste the post text below — it is what visitors read on the post page.'}
                    </span>
                  </div>
                </EditorGroup>

                <EditorGroup title="Card details" icon="edit">
                  <div className="admin-grid-2">
                    <div className="admin-span-2">
                      <TextField label="title" value={activeResource.title} onChange={(value) => patchActive({ title: value })} />
                    </div>
                    <div className="admin-span-2">
                      <TextField
                        label="summary"
                        displayLabel="Summary"
                        multiline
                        minRows={2}
                        max={220}
                        hint="One or two lines shown under the title."
                        value={activeResource.summary}
                        onChange={(value) => patchActive({ summary: value })}
                      />
                    </div>
                    <SelectField
                      label="Category"
                      value={activeResource.category}
                      options={categoryOptions}
                      onChange={(value) => patchActive({ category: value })}
                    />
                    <label className="admin-field">
                      <span className="admin-label">Date posted</span>
                      <input
                        type="date"
                        value={activeResource.published_at || ''}
                        onChange={(event) => patchActive({ published_at: event.target.value })}
                        className="admin-input"
                      />
                    </label>
                    <SegmentedField
                      label="Status"
                      value={activeResource.status}
                      options={statusOptions}
                      onChange={(value) => patchActive({ status: value })}
                    />
                    <ToggleField
                      label="featured"
                      displayLabel="Featured"
                      hint="Pinned to the top."
                      value={activeResource.featured}
                      onChange={(value) => patchActive({ featured: value })}
                    />
                  </div>
                </EditorGroup>

                <EditorGroup
                  title="Post text & image"
                  icon="file"
                  hint="Shown in full on the post page."
                  collapsible
                  defaultOpen
                >
                  <label className="admin-field">
                    <span className="admin-label">Post text</span>
                    <AutoTextarea
                      minRows={8}
                      value={activeResource.body}
                      onChange={(value) => patchActive({ body: value })}
                      placeholder="Paste the full LinkedIn post. Leave a blank line between paragraphs. Wrap words in **double stars** for bold."
                    />
                  </label>
                  <MediaUploadField
                    label="imageUrl"
                    displayLabel="Cover image or video"
                    hint="Upload an image, or paste an image or .mp4 link. Videos play on the post page."
                    value={activeResource.image_url}
                    onChange={(value) => patchActive({ image_url: value })}
                  />
                  <TextField
                    label="alt"
                    displayLabel="Image alt text"
                    value={activeResource.image_alt}
                    onChange={(value) => patchActive({ image_alt: value })}
                  />
                  <TagInput tags={activeResource.tags || []} onChange={(tags) => patchActive({ tags })} />
                </EditorGroup>
              </div>

              <aside className="admin-preview">
                <p className="admin-preview-label">
                  <Icon name="eye" size={14} />
                  Live preview
                </p>
                <ResourceCard
                  key={activeResource.id || 'new'}
                  resource={activeResource}
                  variant={activeResource.featured ? 'featured' : 'default'}
                  linkable={false}
                />
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
