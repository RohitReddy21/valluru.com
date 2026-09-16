import { useState } from 'react';
import { AutoTextarea, EditorGroup, MediaUploadField, SegmentedField, TextField, ToggleField } from './AdminFields';
import { Icon } from './AdminIcons';

const statusOptions = [
  ['draft', 'Draft'],
  ['published', 'Published'],
];

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

export default function BlogManager({ blogs = [], onChange }) {
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
    const nextBlog = { ...blog, id: `blog-${Date.now()}`, title: `${blog.title} Copy`, status: 'draft', featured: false };
    onChange([nextBlog, ...blogs]);
    setActiveBlogId(nextBlog.id);
  }

  function deleteBlog(blogId) {
    if (!window.confirm('Delete this blog post?')) return;
    const nextBlogs = blogs.filter((blog) => blog.id !== blogId);
    onChange(nextBlogs);
    setActiveBlogId(nextBlogs[0]?.id || '');
  }

  const words = activeBlog?.body ? activeBlog.body.trim().split(/\s+/).length : 0;

  return (
    <div className="admin-pane-inner">
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Insights blog</h1>
          <p className="admin-page-sub">Drafts stay hidden. Published posts go live after you click Save site.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={addBlog}>
          <Icon name="plus" size={16} />
          New blog post
        </button>
      </div>

      <div className="admin-columns">
        <div className="admin-list">
          {blogs.length === 0 && <p className="admin-empty-note">No blog posts yet.</p>}

          {blogs.map((blog) => (
            <div key={blog.id} className={`admin-row admin-nav-row${activeBlog?.id === blog.id ? ' is-active' : ''}`}>
              <button type="button" className="admin-row-main" onClick={() => setActiveBlogId(blog.id)}>
                <span className={`admin-status-dot${blog.status === 'published' ? ' is-live' : ''}`}></span>
                <span className="min-w-0 flex-1">
                  <span className="admin-item-title">{blog.title || 'Untitled blog'}</span>
                  <span className="admin-item-snippet">
                    {blog.status === 'published' ? 'Published' : 'Draft'} · {blog.date || 'No date'}
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>

        {!activeBlog ? (
          <div className="admin-empty">
            <Icon name="edit" size={28} />
            <p>Select a blog post, or create a new one.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="admin-editor-bar">
              <div className="min-w-0">
                <span className="admin-type-badge" style={{ '--badge': activeBlog.status === 'published' ? '#16a34a' : '#64748b' }}>
                  {activeBlog.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <h2 className="admin-editor-title">{activeBlog.title || 'Untitled blog'}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SegmentedField
                  value={activeBlog.status || 'draft'}
                  options={statusOptions}
                  onChange={(value) => updateBlog(activeBlog.id, { status: value })}
                />
                <button type="button" className="admin-icon-btn" title="Duplicate post" onClick={() => duplicateBlog(activeBlog)}>
                  <Icon name="copy" size={16} />
                </button>
                <button type="button" className="admin-icon-btn is-danger" title="Delete post" onClick={() => deleteBlog(activeBlog.id)}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>

            <EditorGroup title="Headline" icon="edit">
              <div className="admin-grid-2">
                <div className="admin-span-2">
                  <TextField label="title" value={activeBlog.title} onChange={(value) => updateBlog(activeBlog.id, { title: value })} />
                </div>
                <div className="admin-span-2">
                  <TextField label="subtitle" value={activeBlog.subtitle} onChange={(value) => updateBlog(activeBlog.id, { subtitle: value })} />
                </div>
                <TextField label="category" value={activeBlog.category} onChange={(value) => updateBlog(activeBlog.id, { category: value })} />
                <label className="admin-field">
                  <span className="admin-label">Date</span>
                  <input
                    type="date"
                    value={activeBlog.date || ''}
                    onChange={(event) => updateBlog(activeBlog.id, { date: event.target.value })}
                    className="admin-input"
                  />
                </label>
                <div className="admin-span-2">
                  <TextField
                    label="excerpt"
                    value={activeBlog.excerpt}
                    max={220}
                    hint="Shown on the blog card."
                    onChange={(value) => updateBlog(activeBlog.id, { excerpt: value })}
                  />
                </div>
                <div className="admin-span-2">
                  <ToggleField
                    label="featured"
                    displayLabel="Featured post"
                    hint="Pinned to the top of the list."
                    value={activeBlog.featured}
                    onChange={(value) => updateBlog(activeBlog.id, { featured: value })}
                  />
                </div>
              </div>
            </EditorGroup>

            <EditorGroup title="Article" icon="file" hint={`${words} words · leave a blank line between paragraphs`}>
              <AutoTextarea
                minRows={12}
                value={activeBlog.body}
                onChange={(value) => updateBlog(activeBlog.id, { body: value })}
                className="admin-textarea-article"
                placeholder="Write or paste your full blog here."
              />
            </EditorGroup>

            <EditorGroup title="Image, author & source" icon="image" collapsible defaultOpen={false}>
              <MediaUploadField label="imageUrl" displayLabel="Cover image" value={activeBlog.imageUrl} onChange={(value) => updateBlog(activeBlog.id, { imageUrl: value })} />
              <div className="admin-grid-2">
                <TextField label="imageAlt" displayLabel="Image alt text" value={activeBlog.imageAlt} onChange={(value) => updateBlog(activeBlog.id, { imageAlt: value })} />
                <TextField label="author" value={activeBlog.author} onChange={(value) => updateBlog(activeBlog.id, { author: value })} />
                <div className="admin-span-2">
                  <TextField label="sourceUrl" displayLabel="Original source link" placeholder="https://…" value={activeBlog.sourceUrl} onChange={(value) => updateBlog(activeBlog.id, { sourceUrl: value })} />
                </div>
              </div>
            </EditorGroup>
          </div>
        )}
      </div>
    </div>
  );
}
