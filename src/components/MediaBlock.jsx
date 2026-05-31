function isVideo(url = '') {
  return /\.(mp4|webm|ogg)$/i.test(url);
}

export function SectionBackground({ section }) {
  const backgroundVideo = section.backgroundVideo;
  const backgroundImage = section.backgroundImage || '/hero-tech-bg.png';

  return (
    <>
      {backgroundVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[var(--hero-media-opacity)]"
          autoPlay
          muted
          loop
          playsInline
          poster={backgroundImage}
          aria-hidden="true"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-[var(--hero-media-opacity)]"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-[var(--deep-navy)] opacity-[var(--hero-overlay-opacity)]" aria-hidden="true"></div>
    </>
  );
}

export function InlineMedia({ item, className = '' }) {
  if (!item?.url && !item?.icon) return null;

  if (item.icon && !item.url) {
    return (
      <div className={`media-icon ${className}`} aria-hidden="true">
        {item.icon}
      </div>
    );
  }

  if (item.type === 'video' || isVideo(item.url)) {
    return (
      <video className={`media-frame ${className}`} controls playsInline poster={item.poster || ''}>
        <source src={item.url} type="video/mp4" />
      </video>
    );
  }

  return (
    <img
      src={item.url}
      alt={item.alt || item.title || ''}
      className={`media-frame ${className}`}
      loading="lazy"
    />
  );
}

export function MediaGallery({ items }) {
  if (!items?.length) return null;

  return (
    <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <figure key={`${item.url || item.icon}-${index}`} className="surface-card-light">
          <InlineMedia item={item} />
          {(item.title || item.caption) && (
            <figcaption className="mt-4">
              {item.title && <h3 className="font-bold text-[var(--deep-navy)]">{item.title}</h3>}
              {item.caption && <p className="mt-2 text-sm text-[var(--muted-blue)]">{item.caption}</p>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
