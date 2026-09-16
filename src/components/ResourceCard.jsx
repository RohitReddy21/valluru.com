import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import {
  formatResourceDate,
  isVideoMedia,
  resourcePath,
  resourcePullQuote,
  resourceReadingMinutes,
  resourceTextParagraphs,
  stripBold,
  videoPosterUrl,
} from '../data/resources';

function ResourceCover({ resource }) {
  const url = resource.image_url;
  if (!url) return null;

  if (isVideoMedia(url)) {
    const poster = videoPosterUrl(url);
    return (
      <div className="resource-cover is-video">
        {poster ? (
          <OptimizedImage src={poster} alt={resource.image_alt || resource.title} className="h-full w-full object-cover" />
        ) : (
          // #t= makes browsers paint a real frame instead of a black box.
          <video src={`${url}#t=0.5`} muted playsInline preload="metadata" aria-hidden="true"></video>
        )}
        <span className="resource-play" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11.1-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z" />
          </svg>
          Watch
        </span>
      </div>
    );
  }

  return (
    <div className="resource-cover">
      <OptimizedImage src={url} alt={resource.image_alt || resource.title} className="h-full w-full object-cover" />
    </div>
  );
}

export function LinkedInGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export function ResourceMeta({ resource, withReadingTime = true }) {
  const date = formatResourceDate(resource.published_at);
  const isLinkedIn = resource.category === 'LinkedIn Post';

  return (
    <div className="resource-meta">
      <span className={`resource-chip${isLinkedIn ? ' is-linkedin' : ''}`}>
        {isLinkedIn && <LinkedInGlyph size={12} />}
        {resource.category || 'Resource'}
      </span>
      {date && <span className="resource-date">{date}</span>}
      {withReadingTime && resource.body && (
        <span className="resource-date">· {resourceReadingMinutes(resource)} min read</span>
      )}
    </div>
  );
}

/**
 * A native card instead of the LinkedIn iframe: the embed scrolls inside the
 * card and loads slowly on phones, so the full text lives on the detail page.
 */
export default function ResourceCard({ resource, variant = 'default', linkable = true }) {
  const path = linkable ? resourcePath(resource) : '';
  const isFeatured = variant === 'featured';
  const pullQuote = isFeatured ? resourcePullQuote(resource) : '';
  // Without a cover the card sits beside taller image cards, so it uses the post's own
  // opening lines (clamped in CSS) instead of the short summary to fill that height.
  const isTextOnly = !isFeatured && !resource.image_url;
  const openingLines = stripBold(resourceTextParagraphs(resource).join(' ').replace(/\s+/g, ' '));
  const teaser = (isTextOnly && openingLines) || resource.summary || openingLines;
  const tags = (resource.tags || []).slice(0, isFeatured ? 5 : 3);

  const content = (
    <>
      <ResourceCover resource={resource} />

      <div className="resource-body">
        <ResourceMeta resource={resource} />

        {resource.title && <h3 className="resource-title">{resource.title}</h3>}
        {teaser && <p className={`resource-summary${isTextOnly ? ' is-long' : ''}`}>{teaser}</p>}

        {tags.length > 0 && (
          <ul className="resource-tags">
            {tags.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        )}

        <span className="resource-link">
          {isVideoMedia(resource.image_url) ? 'Watch & read' : 'Read post'}
          <span aria-hidden="true" className="resource-link-arrow">→</span>
        </span>
      </div>

      {pullQuote && !resource.image_url && (
        <blockquote className="resource-quote">
          <span className="resource-quote-mark" aria-hidden="true">“</span>
          <p>{pullQuote}</p>
        </blockquote>
      )}
    </>
  );

  const className = [
    'resource-card',
    isFeatured && 'is-featured',
    resource.image_url ? 'has-media' : pullQuote && 'has-quote',
  ]
    .filter(Boolean)
    .join(' ');

  // The admin preview must not navigate away from unsaved edits.
  if (!path) return <article className={className}>{content}</article>;

  return (
    <Link to={path} className={className}>
      {content}
    </Link>
  );
}
