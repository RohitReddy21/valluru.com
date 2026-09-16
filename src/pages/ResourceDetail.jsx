import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import ResourceCard, { LinkedInGlyph, ResourceMeta } from '../components/ResourceCard';
import { PERSON_NAME, SITE_URL } from '../data/seoConfig';
import {
  findResourceBySlug,
  formatResourceDate,
  isVideoMedia,
  loadPublishedResources,
  resourceBlocks,
  resourcePath,
  resourceTextParagraphs,
  stripBold,
  videoPosterUrl,
} from '../data/resources';

// Post text is plain text; turn bare links (e.g. the essay a post shares) into anchors.
function LinkifiedText({ text }) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer" className="resource-prose-link">
        {part.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '')}
      </a>
    ) : (
      part
    ),
  );
}

// LinkedIn has no bold, so posts fake it with Unicode letters; we store those as **bold** instead.
function RichText({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={index}>
        <LinkifiedText text={part.slice(2, -2)} />
      </strong>
    ) : (
      <LinkifiedText key={index} text={part} />
    ),
  );
}

function PageGallery({ urls, title }) {
  const trackRef = useRef(null);

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;
    const page = track.querySelector('.resource-gallery-page');
    track.scrollBy({ left: direction * ((page?.offsetWidth || 300) + 16), behavior: 'smooth' });
  }

  return (
    <figure className="resource-gallery">
      <div className="resource-gallery-head">
        <figcaption>
          {urls.length} pages <span aria-hidden="true">·</span> swipe, or tap a page to open it full size
        </figcaption>
        <div className="resource-gallery-nav">
          <button type="button" onClick={() => scrollByPage(-1)} aria-label="Previous page">
            ←
          </button>
          <button type="button" onClick={() => scrollByPage(1)} aria-label="Next page">
            →
          </button>
        </div>
      </div>
      <div className="resource-gallery-track" ref={trackRef}>
        {urls.map((url, index) => (
          <a key={url} className="resource-gallery-page" href={url} target="_blank" rel="noreferrer">
            <img src={url} alt={`${title}, page ${index + 1} of ${urls.length}`} loading="lazy" decoding="async" />
            <span className="resource-gallery-number">{index + 1}</span>
          </a>
        ))}
      </div>
    </figure>
  );
}

function ArticleBlock({ block, title }) {
  if (block.type === 'images') {
    if (block.urls.length > 1) return <PageGallery urls={block.urls} title={title} />;
    return (
      <a className="resource-figure" href={block.urls[0]} target="_blank" rel="noreferrer" title="Open full-size image">
        <img src={block.urls[0]} alt={title} loading="lazy" decoding="async" />
      </a>
    );
  }

  if (block.type === 'pdf') {
    return (
      <a className="resource-download" href={block.url} target="_blank" rel="noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Download the PDF
      </a>
    );
  }

  return (
    <p>
      <RichText text={block.text} />
    </p>
  );
}

function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <section className="resource-hero">
        <div className="container-custom relative z-10">
          <div className="h-4 w-32 animate-pulse rounded bg-white/20"></div>
          <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-white/20"></div>
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-white/15"></div>
        </div>
      </section>
      <div className="container-custom py-14">
        <div className="resource-article grid gap-4">
          {[100, 92, 96, 70].map((width) => (
            <div key={width} className="h-4 animate-pulse rounded bg-[var(--surface-grey)]" style={{ width: `${width}%` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShareActions({ resource }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = `${SITE_URL}${resourcePath(resource)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', pageUrl);
    }
  }

  return (
    <div className="resource-share">
      <button type="button" className="resource-share-btn" onClick={copyLink}>
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <a
        className="resource-share-btn"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noreferrer"
      >
        Share
      </a>
    </div>
  );
}

export default function ResourceDetail() {
  const { slug } = useParams();
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

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

  if (isLoading) return <DetailSkeleton />;

  const resource = findResourceBySlug(resources, slug);

  if (!resource) {
    return (
      <section className="py-20 sm:py-28">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="container-custom">
          <div className="resource-empty">
            <p className="text-xl font-bold text-[var(--deep-navy)]">
              {loadError ? 'Resources are not available right now.' : 'This post could not be found.'}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-blue)]">
              {loadError || 'It may have been moved or unpublished.'}
            </p>
            <Link to="/resources" className="btn-primary mt-6 inline-flex">
              Back to all resources
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const blocks = resourceBlocks(resource);
  const isLinkedIn = resource.category === 'LinkedIn Post';
  const pageTitle = `${resource.title || 'Resource'} | ${PERSON_NAME}`;
  const description = resource.summary || stripBold(resourceTextParagraphs(resource)[0] || '');
  const canonical = `${SITE_URL}${resourcePath(resource)}`;
  const related = resources.filter((item) => item.id !== resource.id).slice(0, 3);
  const shareImage = isVideoMedia(resource.image_url)
    ? videoPosterUrl(resource.image_url)
    : resource.image_url?.startsWith('http') && resource.image_url;

  return (
    <div>
      <Helmet prioritizeSeoTags>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        {shareImage && <meta property="og:image" content={shareImage} />}
        {shareImage && <meta property="og:image:secure_url" content={shareImage} />}
        {shareImage && <meta name="twitter:image" content={shareImage} />}
        {shareImage && <meta name="twitter:card" content="summary_large_image" />}
      </Helmet>

      <section className="resource-hero">
        <div className="container-custom relative z-10">
          <Link to="/resources" className="resource-back">
            <span aria-hidden="true">←</span> All resources
          </Link>

          <div className="resource-detail-head">
            <ResourceMeta resource={resource} />
            <h1 className="resource-detail-title">{resource.title}</h1>
            {resource.summary && <p className="resource-detail-lead">{resource.summary}</p>}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-16">
        <div className="container-custom resource-detail-layout">
          <article className="resource-article">
            {resource.image_url && (
              <div className="resource-article-cover">
                {isVideoMedia(resource.image_url) ? (
                  <video
                    src={resource.image_url}
                    poster={videoPosterUrl(resource.image_url) || undefined}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={resource.image_alt || resource.title}
                  ></video>
                ) : (
                  // Covers are often detailed diagrams that are unreadable at phone width.
                  <a href={resource.image_url} target="_blank" rel="noreferrer" title="Open full-size image">
                    <OptimizedImage
                      src={resource.image_url}
                      alt={resource.image_alt || resource.title}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  </a>
                )}
              </div>
            )}

            {blocks.length > 0 ? (
              <div className="resource-prose">
                {blocks.map((block, index) => (
                  <ArticleBlock key={index} block={block} title={resource.title} />
                ))}
              </div>
            ) : (
              <p className="resource-prose text-[var(--muted-blue)]">
                The full text of this post is on {isLinkedIn ? 'LinkedIn' : 'the original page'}.
              </p>
            )}

            {resource.tags?.length > 0 && (
              <ul className="resource-detail-tags">
                {resource.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
            )}
          </article>

          <aside className="resource-aside">
            <div className="resource-aside-card">
              <div className="resource-author">
                <span className="resource-author-mark" aria-hidden="true">SV</span>
                <div>
                  <p className="resource-author-name">{PERSON_NAME}</p>
                  <p className="resource-author-sub">
                    {isLinkedIn ? 'Posted on LinkedIn' : 'Published'}
                    {resource.published_at ? ` · ${formatResourceDate(resource.published_at)}` : ''}
                  </p>
                </div>
              </div>

              {resource.post_url && (
                <a className="resource-original-btn" href={resource.post_url} target="_blank" rel="noreferrer">
                  {isLinkedIn && <LinkedInGlyph size={16} />}
                  {isLinkedIn ? 'View & comment on LinkedIn' : 'Open original'}
                </a>
              )}

              <ShareActions resource={resource} />
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-[var(--surface-grey)] bg-[var(--warm-white)] py-14 sm:py-20">
          <div className="container-custom">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-[var(--deep-navy)]">More posts</h2>
              <Link to="/resources" className="resource-back is-dark">
                View all <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="resource-grid">
              {related.map((item) => (
                <ResourceCard key={item.id} resource={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16 pt-4 sm:pb-20">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--corner-radius)] border border-[var(--surface-grey)] bg-white p-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--deep-navy)]">Want to talk this through?</h2>
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
