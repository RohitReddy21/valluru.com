import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AdminEditButton from './AdminEditButton';
import { InlineMedia, MediaGallery, SectionBackground } from './MediaBlock';

function SectionShell({ section, pageKey, children, className = 'dark-section' }) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`editable-section scroll-reveal ${inView ? 'in-view' : ''} ${className}`} id={section.id}>
      <AdminEditButton pageKey={pageKey} sectionId={section.id} />
      {children}
    </section>
  );
}

function hasText(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function formatKeyLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getDetailRows(item) {
  if (Array.isArray(item.fields)) {
    return item.fields
      .map((field) => ({
        label: field.label || '',
        value: field.value ?? field.body ?? '',
      }))
      .filter((field) => hasText(field.value));
  }

  return Object.entries(item)
    .filter(([key, value]) => (
      !['title', 'company', 'lane', 'sector', 'icon', 'iconUrl', 'logoUrl', 'media', 'mediaUrl', 'mediaType', 'fields'].includes(key) &&
      !Array.isArray(value) &&
      typeof value !== 'object' &&
      hasText(value)
    ))
    .map(([key, value]) => ({ label: formatKeyLabel(key), value }));
}

function formatDetailLabel(label) {
  const cleanLabel = String(label || '').trim();
  const labelMap = {
    role: 'Role',
    descriptor: 'Descriptor',
    thesis: 'Thesis',
    'operating role': 'Operating Role',
    link: 'Link',
    problem: 'Problem',
    work: 'Work',
    output: 'Output',
  };

  return labelMap[cleanLabel.toLowerCase()] || cleanLabel;
}

function CardMedia({ card }) {
  const logoUrl = card.logoUrl;
  const iconUrl = card.iconUrl;
  const media = card.media || (card.mediaUrl ? { url: card.mediaUrl, type: card.mediaType, alt: card.title } : null);

  if (logoUrl) {
    return (
      <div className="logo-mark mb-4">
        <img src={logoUrl} alt={`${card.title || card.company || card.lane || 'Card'} logo`} />
      </div>
    );
  }

  if (iconUrl) {
    return (
      <div className="icon-image-mark mb-4">
        <img src={iconUrl} alt={`${card.title || card.company || card.lane || 'Card'} icon`} />
      </div>
    );
  }

  if (media?.url) {
    return <InlineMedia item={media} className="mb-5 aspect-video" />;
  }

  if (card.icon) {
    return <div className="media-icon mb-4">{card.icon}</div>;
  }

  return null;
}

function CardHeader({ card, fallbackNumber }) {
  const title = card.title || card.company || card.lane;
  const hasVisual = card.logoUrl || card.iconUrl || card.icon || card.media?.url || card.mediaUrl;

  if (card.media?.url || card.mediaUrl) {
    return (
      <>
        <CardMedia card={card} />
        {hasText(title) && <h3 className="mb-3 text-lg font-bold text-[var(--deep-navy)]">{title}</h3>}
      </>
    );
  }

  return (
    <div className="mb-4 flex items-center gap-4">
      {hasVisual ? <CardMedia card={card} /> : <div className="number-badge shrink-0">{fallbackNumber}</div>}
      {hasText(title) && <h3 className="min-w-0 text-lg font-bold text-[var(--deep-navy)]">{title}</h3>}
    </div>
  );
}

function CtaGroup({ section }) {
  const ctas = [section.primaryCta, section.secondaryCta, section.tertiaryCta].filter(Boolean);
  if (!ctas.length) return null;

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      {ctas.map((cta, index) => (
        <Link key={`${cta.href}-${cta.label}`} to={cta.href} className={index === 1 ? 'btn-secondary' : 'btn-primary'}>
          {cta.label}
        </Link>
      ))}
    </div>
  );
}

function Hero({ section, pageKey }) {
  const proofPoints = section.proofPoints || ['Build', 'Back', 'Scale', 'Govern'];

  return (
    <SectionShell
      section={section}
      pageKey={pageKey}
      className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden bg-[var(--deep-navy)] py-16 sm:py-20"
    >
      <SectionBackground section={section} />
      <div className="hero-motion-grid" aria-hidden="true"></div>
      <div className="hero-scan-line" aria-hidden="true"></div>
      <div className="container-custom relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div className="hero-copy space-y-6">
          {hasText(section.eyebrow) && <div className="text-sm font-semibold tracking-widest text-[var(--gold)]">{section.eyebrow}</div>}
          {hasText(section.title) && <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">{section.title}</h1>}
          {hasText(section.body) && <p className="max-w-2xl text-lg leading-relaxed text-[var(--warm-white)] sm:text-xl">{section.body}</p>}
          {hasText(section.supporting) && (
            <p className="max-w-2xl border-l-4 border-[var(--gold)] pl-5 text-base leading-relaxed text-[var(--warm-white)] sm:text-lg">
              {section.supporting}
            </p>
          )}

          <div className="grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {proofPoints.map((point) => (
              <div key={point} className="rounded-lg border border-[var(--mid-navy)] bg-[var(--mid-navy)] px-4 py-3 text-center">
                <p className="text-sm font-bold text-white">{point}</p>
              </div>
            ))}
          </div>

          <CtaGroup section={section} />
        </div>

        <div className="hero-portrait flex justify-center lg:justify-end">
          {section.media?.url ? (
            <div className="hero-portrait-frame w-[min(78vw,28rem)] lg:w-[30rem]">
              <InlineMedia item={section.media} className="h-full w-full rounded-none object-cover" />
            </div>
          ) : (
            <div className="flex w-[min(78vw,28rem)] flex-col items-center justify-center rounded-lg border border-[var(--gold)]/30 bg-[var(--deep-navy)]/40 p-8 text-center lg:w-[30rem]">
              <div className="media-icon mb-5">SV</div>
              <p className="text-lg font-bold text-white">Add your image in admin</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--warm-white)]">
                Edit this section and set media.url to a file in public.
              </p>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function PageHero({ section, pageKey }) {
  const contentWidth = section.wide ? 'max-w-6xl' : 'max-w-3xl';
  const titleSize = section.wide
    ? 'text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl'
    : 'text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl';

  return (
    <SectionShell
      section={section}
      pageKey={pageKey}
      className="relative flex min-h-[46vh] items-center overflow-hidden border-b border-[var(--mid-navy)] bg-[var(--deep-navy)] py-16 sm:py-20"
    >
      <SectionBackground section={section} />
      <div className="hero-motion-grid" aria-hidden="true"></div>
      <div className="hero-scan-line" aria-hidden="true"></div>
      <div className="container-custom relative z-10">
        <div className={contentWidth}>
          {hasText(section.eyebrow) && <div className="mb-4 text-sm font-semibold tracking-widest text-[var(--gold)]">{section.eyebrow}</div>}
          {hasText(section.title) && <h1 className={`mb-6 ${titleSize}`}>{section.title}</h1>}
          {hasText(section.body) && <p className="mb-8 text-lg leading-relaxed text-[var(--warm-white)] sm:text-xl">{section.body}</p>}
          <CtaGroup section={section} />
        </div>
      </div>
    </SectionShell>
  );
}

function TextFlow({ section, pageKey }) {
  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        {hasText(section.eyebrow) && <div className="eyebrow mb-4">{section.eyebrow}</div>}
        {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div>
            {hasText(section.body) && <p className="text-xl leading-relaxed text-[var(--muted-blue)]">{section.body}</p>}
          </div>
          <div className="surface-card">
            <ul className="space-y-3">
              {section.bullets?.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]"></span>
                  <span className="text-[var(--deep-navy)]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <MediaGallery items={section.mediaItems} />
      </div>
    </SectionShell>
  );
}

function Cards({ section, pageKey }) {
  const visibleCards = (section.cards || []).filter((card) => !card.hidden);
  const isFeatureGrid = visibleCards.length <= 3;
  const gridClass = isFeatureGrid ? 'grid gap-6 lg:grid-cols-3' : 'grid gap-6 md:grid-cols-2 xl:grid-cols-4';

  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        {hasText(section.eyebrow) && <div className="eyebrow mb-4">{section.eyebrow}</div>}
        {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
        {hasText(section.body) && <p className="section-copy mb-12 mt-5">{section.body}</p>}

        <div className={gridClass}>
          {visibleCards.map((card, idx) => (
            <article key={`${card.title}-${idx}`} className="surface-card card-hover stagger-item">
              <CardHeader card={card} fallbackNumber={idx + 1} />
              {hasText(card.body) && <p className="text-sm leading-relaxed text-[var(--muted-blue)]">{card.body}</p>}
              {hasText(card.link) && <p className="mt-5 rounded-lg bg-[var(--warm-white)] px-4 py-3 text-sm font-semibold text-[var(--deep-navy)]">{card.link}</p>}
            </article>
          ))}
        </div>

        <MediaGallery items={section.mediaItems} />

        {section.primaryCta && (
          <div className="mt-12 flex justify-center">
            <Link to={section.primaryCta.href} className="btn-primary">
              {section.primaryCta.label}
            </Link>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function DetailCards({ section, pageKey }) {
  const visibleItems = (section.items || []).filter((item) => !item.hidden);

  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        {hasText(section.eyebrow) && <div className="eyebrow mb-4">{section.eyebrow}</div>}
        {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
        {hasText(section.body) && <p className="section-copy mt-6">{section.body}</p>}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item, idx) => {
            const rows = getDetailRows(item);

            return (
              <article key={`${item.title || item.company || item.lane}-${idx}`} className="surface-card detail-card card-hover stagger-item">
                <CardHeader card={item} fallbackNumber={idx + 1} />
                {hasText(item.sector) && <p className="mb-5 text-sm font-semibold leading-relaxed text-[var(--muted-blue)]">{item.sector}</p>}
                {rows.length > 0 && (
                  <div className="space-y-4 text-sm leading-relaxed">
                    {rows.map((row, rowIndex) => (
                      <p key={`${row.label}-${rowIndex}`}>
                        {hasText(row.label) && <span className="font-bold text-[var(--deep-navy)]">{formatDetailLabel(row.label)}: </span>}
                        <span className="text-[var(--muted-blue)]">{row.value}</span>
                      </p>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function ContactForm({ section, pageKey }) {
  const visibleFields = (section.fields || []).filter((field) => !field.hidden);

  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        <div className="mx-auto max-w-6xl">
          {hasText(section.eyebrow) && <div className="eyebrow mb-4">{section.eyebrow}</div>}
          {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
          {hasText(section.body) && <p className="section-copy mt-6">{section.body}</p>}
          <form className="mt-10 rounded-2xl border border-[var(--surface-grey)] bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6 lg:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              {visibleFields.map((field) => (
                <label key={field.name} className="field-card block">
                  <span className="mb-3 block text-base font-bold text-[var(--deep-navy)]">{field.label}</span>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full resize-y rounded-md border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-[var(--deep-navy)] outline-none transition placeholder:text-[var(--muted-blue)] focus:border-[var(--gold)]"
                    />
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="w-full rounded-md border border-[var(--surface-grey)] bg-[var(--warm-white)] px-4 py-3 text-[var(--deep-navy)] outline-none transition placeholder:text-[var(--muted-blue)] focus:border-[var(--gold)]"
                    />
                  )}
                </label>
              ))}
            </div>
            <button type="submit" className="btn-warm mt-6 w-full sm:w-auto">
              {section.submitLabel || 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </SectionShell>
  );
}

export default function SectionRenderer({ section, pageKey }) {
  if (section.hidden) return null;
  if (section.type === 'hero') return <Hero section={section} pageKey={pageKey} />;
  if (section.type === 'page-hero') return <PageHero section={section} pageKey={pageKey} />;
  if (section.type === 'text-flow') return <TextFlow section={section} pageKey={pageKey} />;
  if (section.type === 'cards') return <Cards section={section} pageKey={pageKey} />;
  if (section.type === 'detail-cards') return <DetailCards section={section} pageKey={pageKey} />;
  if (section.type === 'contact-form') return <ContactForm section={section} pageKey={pageKey} />;
  return <Cards section={{ ...section, cards: section.cards || section.items || [] }} pageKey={pageKey} />;
}
