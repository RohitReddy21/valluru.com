import { Link } from 'react-router-dom';
import ScrollLink from './ScrollLink';

function renderCta(cta, className) {
  if (!cta) return null;
  const isAnchor = cta.href.includes('#');
  const Component = isAnchor ? ScrollLink : Link;
  return (
    <Component key={cta.href} to={cta.href} className={className}>
      {cta.label}
    </Component>
  );
}

export default function PageHero({ section }) {
  const contentWidth = section.wide ? 'max-w-6xl' : 'max-w-3xl';
  const titleSize = section.wide
    ? 'text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl'
    : 'text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl';
  const backgroundVideo = section.backgroundVideo || '/hero-background.mp4';

  return (
    <section className="relative flex min-h-[46vh] items-center overflow-hidden border-b border-[var(--mid-navy)] bg-[var(--deep-navy)] py-16 sm:py-20">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[var(--deep-navy)]/75" aria-hidden="true"></div>

      <div className="container-custom relative z-10">
        <div className={contentWidth}>
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--gold)]">{section.eyebrow}</div>
          <h1 className={`mb-6 ${titleSize}`}>
            {section.title}
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-[var(--warm-white)] sm:text-xl">{section.body}</p>

          {renderCta(section.primaryCta, 'btn-primary')}
        </div>
      </div>
    </section>
  );
}
