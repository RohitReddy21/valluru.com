import { useMemo, useState } from 'react';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function splitBody(body) {
  return String(body || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function BlogArchive({ blogs = [] }) {
  const publishedBlogs = useMemo(
    () => blogs
      .filter((blog) => blog.status !== 'draft')
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)),
    [blogs],
  );
  const [activeBlogId, setActiveBlogId] = useState(publishedBlogs[0]?.id || '');
  const activeBlog = publishedBlogs.find((blog) => blog.id === activeBlogId) || publishedBlogs[0];

  if (!publishedBlogs.length) {
    return (
      <section className="dark-section">
        <div className="container-custom">
          <div className="rounded-xl border border-[var(--surface-grey)] bg-white p-8 shadow-lg shadow-slate-900/10">
            <p className="eyebrow mb-3">Blog Archive</p>
            <h2 className="section-title">Your published blogs will appear here.</h2>
            <p className="section-copy mt-5">
              Add posts from Admin CMS, set status to Published, then save to live storage.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="dark-section blog-archive-section">
      <div className="container-custom">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Blog Archive</p>
            <h2 className="section-title">Published writing</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-relaxed text-[var(--muted-blue)]">
            Native articles, public notes, and external pieces collected in one place.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="grid gap-4">
            {publishedBlogs.map((blog) => (
              <button
                key={blog.id}
                type="button"
                onClick={() => setActiveBlogId(blog.id)}
                className={`blog-list-card text-left ${activeBlog?.id === blog.id ? 'is-active' : ''}`}
              >
                <span className="text-xs font-black tracking-[0.16em] text-[var(--gold)]">{blog.category || 'Essay'}</span>
                <span className="mt-2 block text-lg font-bold leading-snug text-[var(--deep-navy)]">{blog.title}</span>
                <span className="mt-2 block text-sm font-semibold text-[var(--muted-blue)]">
                  {formatDate(blog.date)}{blog.author ? ` · ${blog.author}` : ''}
                </span>
              </button>
            ))}
          </div>

          {activeBlog && (
            <article className="blog-reader surface-card">
              {activeBlog.imageUrl && (
                <img
                  src={activeBlog.imageUrl}
                  alt={activeBlog.imageAlt || activeBlog.title}
                  className="mb-6 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <div className="mb-4 flex flex-wrap gap-2">
                {activeBlog.featured && <span className="detail-chip">Featured</span>}
                {activeBlog.category && <span className="detail-chip detail-chip-muted">{activeBlog.category}</span>}
              </div>
              <h3 className="text-3xl font-bold leading-tight text-[var(--deep-navy)]">{activeBlog.title}</h3>
              {activeBlog.subtitle && <p className="mt-3 text-lg font-semibold text-[var(--muted-blue)]">{activeBlog.subtitle}</p>}
              {activeBlog.excerpt && <p className="mt-6 border-l-4 border-[var(--gold)] pl-5 text-base leading-relaxed text-[var(--muted-blue)]">{activeBlog.excerpt}</p>}
              <div className="mt-8 space-y-5 text-base leading-8 text-[var(--deep-navy)]">
                {splitBody(activeBlog.body).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {activeBlog.sourceUrl && (
                <a className="detail-link mt-8" href={activeBlog.sourceUrl} target="_blank" rel="noreferrer">
                  Read original
                </a>
              )}
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
