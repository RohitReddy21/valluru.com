import { Link } from 'react-router-dom';

export default function PageHero({ section }) {
  const contentWidth = section.wide ? 'max-w-6xl' : 'max-w-3xl';
  const titleSize = section.wide
    ? 'text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl'
    : 'text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl';
  const backgroundVideo = section.backgroundVideo || '/hero-background.mp4';

  return (
    <section className="relative flex min-h-[46vh] items-center overflow-hidden border-b border-[#4A3F35] bg-[#2C2C2C] py-16 sm:py-20">
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
      <div className="absolute inset-0 bg-[#2C2C2C]/75" aria-hidden="true"></div>

      <div className="container-custom relative z-10">
        <div className={contentWidth}>
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#B08D57]">{section.eyebrow}</div>
          <h1 className={`mb-6 ${titleSize}`}>
            {section.title}
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-[#F5F4F0] sm:text-xl">{section.body}</p>

          {section.primaryCta && (
            <Link to={section.primaryCta.href} className="btn-primary">
              {section.primaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
