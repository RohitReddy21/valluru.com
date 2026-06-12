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

export default function CardSection({ section }) {
  const isFeatureGrid = section.cards?.length <= 3;
  const gridClass = isFeatureGrid ? 'grid gap-6 lg:grid-cols-3' : 'grid gap-6 md:grid-cols-2 xl:grid-cols-4';

  return (
    <section className="dark-section">
      <div className="container-custom">
        <div className="eyebrow mb-4">{section.eyebrow}</div>
        <h2 className="section-title">{section.title}</h2>
        <p className="section-copy mb-12 mt-5">{section.body}</p>

        <div className={gridClass}>
          {section.cards?.map((card, idx) => (
            <div key={card.title} className="surface-card card-hover">
              <div className="number-badge mb-5">{idx + 1}</div>
              <h3 className="mb-3 text-lg font-bold text-[var(--deep-navy)]">{card.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--muted-blue)]">{card.body}</p>
            </div>
          ))}
        </div>

        {section.primaryCta && (
          <div className="mt-12 flex justify-center">
            {renderCta(section.primaryCta, 'btn-primary')}
          </div>
        )}
      </div>
    </section>
  );
}
