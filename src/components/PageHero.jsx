import { Link } from 'react-router-dom';

export default function PageHero({ section }) {
  return (
    <section className="flex min-h-[46vh] items-center border-b border-blue-900 bg-blue-950 py-16 sm:py-20">
      <div className="container-custom">
        <div className="max-w-3xl">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">{section.eyebrow}</div>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {section.title}
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-blue-100 sm:text-xl">{section.body}</p>

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
