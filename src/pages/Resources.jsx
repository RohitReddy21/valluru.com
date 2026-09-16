import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import { useSiteContent } from '../context/useSiteContent';
import { loadPublishedResources } from '../data/resources';

const fallbackHero = {
  eyebrow: 'Resources',
  title: 'Notes, posts, and published work',
  body: 'LinkedIn posts, articles, and public commentary on applied AI, product architecture, delivery governance, and India execution.',
};

function Skeleton() {
  return (
    <div className="resource-grid" aria-hidden="true">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="resource-card">
          <div className="resource-body">
            <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-grey)]"></div>
            <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-[var(--surface-grey)]"></div>
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--surface-grey)]"></div>
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[var(--surface-grey)]"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Resources() {
  const { siteContent } = useSiteContent();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  // The hero copy stays editable through the existing CMS, but the page must
  // still render if live content predates the resources page.
  const hero = siteContent.pages?.resources?.sections?.[0] || fallbackHero;

  useEffect(() => {
    let cancelled = false;

    loadPublishedResources().then((result) => {
      if (cancelled) return;
      setResources(result.resources);
      setLoadError(result.error);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(resources.map((resource) => resource.category).filter(Boolean))];
    return ['All', ...unique];
  }, [resources]);

  const visibleResources = useMemo(() => {
    const search = query.trim().toLowerCase();

    return resources
      .filter((resource) => activeCategory === 'All' || resource.category === activeCategory)
      .filter((resource) => {
        if (!search) return true;
        const haystack = [resource.title, resource.summary, resource.body, ...(resource.tags || [])]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [resources, activeCategory, query]);

  return (
    <div>
      <section className="resource-hero">
        <div className="container-custom relative z-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--gold)]">
            {hero.eyebrow || fallbackHero.eyebrow}
          </p>
          <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            {hero.title || fallbackHero.title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-[var(--warm-white)]">
            {hero.body || fallbackHero.body}
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="container-custom">
          <div className="resource-toolbar">
            <div className="resource-filters" role="tablist" aria-label="Filter resources by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={`resource-filter${activeCategory === category ? ' is-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <label className="resource-search">
              <span className="sr-only">Search resources</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts, topics, tags"
              />
            </label>
          </div>

          {isLoading && <Skeleton />}

          {!isLoading && loadError && (
            <div className="resource-empty">
              <p className="font-semibold text-[var(--deep-navy)]">Resources are not available right now.</p>
              <p className="mt-2 text-sm text-[var(--muted-blue)]">{loadError}</p>
            </div>
          )}

          {!isLoading && !loadError && visibleResources.length === 0 && (
            <div className="resource-empty">
              <p className="font-semibold text-[var(--deep-navy)]">
                {resources.length === 0 ? 'No resources published yet.' : 'Nothing matches that filter.'}
              </p>
              <p className="mt-2 text-sm text-[var(--muted-blue)]">
                {resources.length === 0
                  ? 'Published LinkedIn posts and articles will appear here.'
                  : 'Try a different category or clear the search.'}
              </p>
            </div>
          )}

          {!isLoading && visibleResources.length > 0 && (
            <div className="resource-grid">
              {visibleResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  variant={resource.featured ? 'featured' : 'default'}
                />
              ))}
            </div>
          )}

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[var(--corner-radius)] border border-[var(--surface-grey)] bg-white p-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--deep-navy)]">Want to talk through one of these?</h2>
              <p className="mt-1 text-sm text-[var(--muted-blue)]">
                Most of this work started as an operating problem, not a slide.
              </p>
            </div>
            <Link to="/contact#contact-form" className="btn-primary">
              Start a working conversation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
