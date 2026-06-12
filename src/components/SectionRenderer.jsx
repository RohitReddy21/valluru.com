import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminEditButton from './AdminEditButton';
import { InlineMedia, MediaGallery, SectionBackground } from './MediaBlock';
import { normalizeMediaUrl } from '../utils/mediaUrl';
import ScrollLink from './ScrollLink';
import fallbackPortrait from '../assets/sasidhar-valluru.jpg';

function getScrollMotion(section) {
  if (section.type === 'hero' || section.type === 'page-hero') return 'hero';

  const motions = ['rise', 'split', 'tilt', 'scale'];
  const seed = String(section.id || section.title || section.type || '')
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return motions[seed % motions.length];
}

function SectionShell({ section, pageKey, children, className = 'dark-section' }) {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const toneClass = section.tone ? `section-tone-${section.tone}` : 'section-tone-light';
  const motionClass = `scroll-motion-${getScrollMotion(section)}`;

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
    <section
      ref={sectionRef}
      className={`editable-section scroll-reveal ${toneClass} ${motionClass} ${inView ? 'in-view' : ''} ${className}`}
      id={section.id}
      data-section-type={section.type}
    >
      <div className="section-ambient" aria-hidden="true"></div>
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
  const logoUrl = normalizeMediaUrl(card.logoUrl);
  const iconUrl = normalizeMediaUrl(card.iconUrl);
  const mediaUrl = normalizeMediaUrl(card.mediaUrl);
  const media = card.media || (mediaUrl ? { url: mediaUrl, type: card.mediaType, alt: card.title } : null);

  if (logoUrl) {
    return (
      <div className="logo-mark">
        <img src={logoUrl} alt={`${card.title || card.company || card.lane || 'Card'} logo`} loading="lazy" decoding="async" />
      </div>
    );
  }

  if (iconUrl) {
    return (
      <div className="icon-image-mark mb-4">
        <img src={iconUrl} alt={`${card.title || card.company || card.lane || 'Card'} icon`} loading="lazy" decoding="async" />
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
    <div className="mb-4 flex flex-col items-center gap-4">
      {hasVisual ? <CardMedia card={card} /> : <div className="number-badge shrink-0">{fallbackNumber}</div>}
      {hasText(title) && <h3 className="text-lg font-bold text-[var(--deep-navy)]">{title}</h3>}
    </div>
  );
}

function CtaGroup({ section }) {
  const ctas = [section.primaryCta, section.secondaryCta, section.tertiaryCta].filter(Boolean);
  if (!ctas.length) return null;

  return (
    <div className="flex flex-wrap gap-4 pt-4">
      {ctas.map((cta, index) => {
        const isAnchor = cta.href.includes('#');
        const LinkComponent = isAnchor ? ScrollLink : Link;
        return (
          <LinkComponent key={`${cta.href}-${cta.label}`} to={cta.href} className={index === 1 ? 'btn-secondary' : 'btn-primary'}>
            {cta.label}
          </LinkComponent>
        );
      })}
    </div>
  );
}

const heroExpertiseCards = [
  { title: 'Applied AI', icon: 'AI' },
  { title: 'Product Architecture', icon: 'PA' },
  { title: 'Operating Model Design', icon: 'OM' },
  { title: 'Enterprise Workflows', icon: 'EW' },
  { title: 'Delivery Governance', icon: 'DG' },
];

function HeroVisual({ section, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = normalizeMediaUrl(section.media?.url);
  const imageSrc = imageFailed || !imageUrl ? fallbackPortrait : imageUrl;

  return (
    <div className={`hero-visual ${className}`}>
      <div className="executive-frame">
        <img
          src={imageSrc}
          alt={section.media.alt || section.title || ''}
          className="executive-portrait mx-auto"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => {
            if (imageSrc !== fallbackPortrait) setImageFailed(true);
          }}
        />
        <div className="expertise-stack" aria-label="Professional expertise">
          {heroExpertiseCards.map((item, idx) => (
            <div className="expertise-card" key={item.title} style={{ '--float-index': idx }}>
              <span className="expertise-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="expertise-chips" aria-label="Professional expertise">
        {heroExpertiseCards.map((item) => (
          <span className="expertise-chip" key={item.title}>{item.title}</span>
        ))}
      </div>
    </div>
  );
}

function Hero({ section, pageKey }) {
  return (
    <SectionShell
      section={section}
      pageKey={pageKey}
      className="personal-hero relative flex min-h-[calc(100svh-84px)] items-center overflow-hidden py-8 sm:py-10 lg:py-12"
    >
      {section.backgroundVideo && (
        <video
          className="hero-bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={normalizeMediaUrl(section.backgroundImage) || '/hero-tech-bg.png'}
          aria-hidden="true"
        >
          <source src={normalizeMediaUrl(section.backgroundVideo)} type="video/mp4" />
        </video>
      )}
      <div className="hero-skyline" aria-hidden="true"></div>
      <div className="hero-grid-pattern" aria-hidden="true"></div>
      <div className="container-custom hero-layout relative z-10 grid items-center lg:min-h-[calc(100svh-180px)] lg:grid-cols-[minmax(0,0.82fr)_minmax(25rem,1fr)]">
        <div className="hero-copy order-2 space-y-6 lg:order-1">
          {hasText(section.eyebrow) && (
            <div className="hero-badge">
              {section.eyebrow}
            </div>
          )}
          <h1 className="hero-headline">
            <span>Investor.</span>
            <span>Operator.</span>
            <span>AI Architect.</span>
            <span className="text-[var(--gold)]">Executive Builder.</span>
          </h1>
          {hasText(section.body) && <p className="hero-description">{section.body}</p>}

          <HeroVisual section={section} className="lg:hidden" />

          <div className="hero-actions">
            {section.primaryCta && (
              (() => {
                const isAnchor = section.primaryCta.href.includes('#');
                const Component = isAnchor ? ScrollLink : Link;
                return <Component to={section.primaryCta.href} className="hero-btn hero-btn-primary">{section.primaryCta.label} <span aria-hidden="true">-&gt;</span></Component>;
              })()
            )}
            {section.secondaryCta && (
              (() => {
                const isAnchor = section.secondaryCta.href.includes('#');
                const Component = isAnchor ? ScrollLink : Link;
                return <Component to={section.secondaryCta.href} className="hero-btn hero-btn-secondary">{section.secondaryCta.label}</Component>;
              })()
            )}
            {section.tertiaryCta && (
              (() => {
                const isAnchor = section.tertiaryCta.href.includes('#');
                const Component = isAnchor ? ScrollLink : Link;
                return <Component to={section.tertiaryCta.href} className="hero-btn hero-btn-ghost">{section.tertiaryCta.label}</Component>;
              })()
            )}
          </div>
        </div>

        <HeroVisual section={section} className="hidden lg:flex lg:order-2" />
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
  const paragraphs = Array.isArray(section.bodyParagraphs) && section.bodyParagraphs.length > 0
    ? section.bodyParagraphs
    : hasText(section.body) ? [section.body] : [];

  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        <div className="tf-grid">
          {/* Left column */}
          <div className="tf-copy stagger-item">
            {hasText(section.eyebrow) && (
              <div className="tf-eyebrow">{section.eyebrow}</div>
            )}
            {hasText(section.title) && (
              <h2 className="tf-title">{section.title}</h2>
            )}
            <div className="tf-body-stack">
              {paragraphs.map((para, i) => (
                <p key={i} className="tf-body">{para}</p>
              ))}
            </div>
          </div>

          {/* Right column — LinkedIn-style list card */}
          {section.bullets?.length > 0 && (
            <div className="tf-card stagger-item">
              <div className="tf-card-header" aria-hidden="true">
                <span className="tf-card-dot" />
                <span className="tf-card-dot" />
                <span className="tf-card-dot" />
              </div>
              {hasText(section.bulletsLabel) && (
                <p className="tf-bullets-label">{section.bulletsLabel}</p>
              )}
              <ul className="tf-list">
                {section.bullets.map((bullet, idx) => (
                  <li
                    key={bullet}
                    className="tf-list-item stagger-child"
                    style={{ '--stagger-index': idx }}
                  >
                    <span className="tf-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="tf-arrow" aria-hidden="true">→</span>
                    <span className="tf-bullet-text">{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="tf-card-glow" aria-hidden="true" />
            </div>
          )}
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
        {hasText(section.eyebrow) && <div className="eyebrow mb-3">{section.eyebrow}</div>}
        {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
        {hasText(section.body) && <p className="section-copy mt-4 mb-8">{section.body}</p>}

        <div className={`${gridClass} mt-8`}>
          {visibleCards.map((card, idx) => {
            const title = card.title || card.company || card.lane;
            const bodyIsDuplicate = card.body?.trim() === title?.trim();
            return (
              <article key={`${card.title}-${idx}`} className="surface-card card-hover stagger-item">
                <CardHeader card={card} fallbackNumber={idx + 1} />
                {hasText(card.body) && !bodyIsDuplicate && (
                  <p className="text-sm leading-relaxed text-[var(--muted-blue)]">{card.body}</p>
                )}
                {hasText(card.link) && (
                  <p className="mt-5 rounded-lg bg-[var(--warm-white)] px-4 py-3 text-sm font-semibold text-[var(--deep-navy)]">{card.link}</p>
                )}
              </article>
            );
          })}
        </div>

        <MediaGallery items={section.mediaItems} />

        {section.primaryCta && (
          <div className="mt-10 flex justify-center">
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
                  <div className="space-y-5 text-sm leading-relaxed">
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
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const visibleFields = (section.fields || []).filter((field) => !field.hidden);
  const formRef = useRef(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    formData.append("access_key", "e93ccd86-fe78-4a4e-adc4-62e47a0fa583");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("✓ Message sent successfully! I'll get back to you soon.");
        formRef.current?.reset();
      } else {
        setResult("Something went wrong. Please try again.");
      }
    } catch {
      setResult("Error sending message. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setResult(""), 5000);
    }
  };

  return (
    <SectionShell section={section} pageKey={pageKey}>
      <div className="container-custom">
        <div className="mx-auto max-w-4xl">
          {hasText(section.eyebrow) && <div className="eyebrow mb-4">{section.eyebrow}</div>}
          {hasText(section.title) && <h2 className="section-title">{section.title}</h2>}
          {hasText(section.body) && <p className="section-copy mt-6 mb-10">{section.body}</p>}

          <form ref={formRef} onSubmit={onSubmit} className="relative rounded-3xl border border-[var(--surface-grey)] bg-gradient-to-br from-white to-[var(--warm-white)] p-6 shadow-2xl shadow-slate-900/10 sm:p-8 lg:p-10 overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--gold)]/5 rounded-full -mr-20 -mt-20 pointer-events-none" aria-hidden="true"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--gold)]/5 rounded-full -ml-16 -mb-16 pointer-events-none" aria-hidden="true"></div>

            <div className="relative z-10">
              <div className="grid gap-6 md:grid-cols-2">
                {visibleFields.map((field) => (
                  <label key={field.name} className={`group block ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold uppercase tracking-wider text-[var(--deep-navy)]">{field.label}</span>
                      <span className="text-[var(--gold)] font-bold">*</span>
                    </div>
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        rows={6}
                        required
                        className="w-full resize-none rounded-xl border-2 border-[var(--surface-grey)] bg-white px-5 py-4 text-[var(--deep-navy)] outline-none transition duration-300 placeholder:text-[var(--muted-blue)] focus:border-[var(--gold)] focus:shadow-lg focus:shadow-[var(--gold)]/20 group-hover:border-[var(--gold)]/50"
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required
                        className="w-full rounded-xl border-2 border-[var(--surface-grey)] bg-white px-5 py-4 text-[var(--deep-navy)] outline-none transition duration-300 placeholder:text-[var(--muted-blue)] focus:border-[var(--gold)] focus:shadow-lg focus:shadow-[var(--gold)]/20 group-hover:border-[var(--gold)]/50"
                      />
                    )}
                  </label>
                ))}
              </div>

              {result && (
                <div className={`mt-8 rounded-xl border-2 px-5 py-4 text-sm font-semibold flex items-center gap-3 animate-slideIn ${
                  result.includes('successfully')
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                  <span className="text-lg">{result.includes('successfully') ? '✓' : '✕'}</span>
                  {result}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative px-8 py-4 font-bold text-white rounded-xl bg-[var(--gold)] hover:bg-[var(--gold)]/90 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl shadow-[var(--gold)]/30 hover:shadow-[var(--gold)]/50 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        {section.submitLabel || 'Send Message'}
                        <span className="transition group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </span>
                </button>
                <div className="text-sm text-[var(--muted-blue)] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span>
                  I'll respond within 24 hours
                </div>
              </div>
            </div>
          </form>

          {/* Trust indicators */}
          {/* <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--gold)]">100%</div>
              <p className="text-xs text-[var(--muted-blue)] uppercase tracking-wide">Secure</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--gold)]">24h</div>
              <p className="text-xs text-[var(--muted-blue)] uppercase tracking-wide">Response</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--gold)]">Direct</div>
              <p className="text-xs text-[var(--muted-blue)] uppercase tracking-wide">Contact</p>
            </div>
          </div> */}
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
