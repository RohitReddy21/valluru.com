import PageHero from '../components/PageHero';
import { siteContent } from '../data/content';

const featuredEssays = [
  ['Most AI failures are operational, not algorithmic', 'Defines the operating thesis.'],
  ['Human-in-the-loop is not a failure of AI', 'Shows practical AI maturity.'],
  ['Edge AI vs Cloud AI is the wrong debate', 'Shows architecture judgment.'],
  ['Why PMO matters in AI companies', 'Connects product, delivery, and governance.'],
  ['Real-time AI needs operating architecture', 'Connects latency, workflow, and business value.'],
];

const categories = [
  ['Featured Essays', 'Best pieces that define the public thesis.'],
  ['AI Operations', 'Production AI, HITL, edge/cloud, model governance, alerting, latency, observability, and trust.'],
  ['Product & Delivery', 'PMO, PRD/BRD, release discipline, product ownership, and execution governance.'],
  ['Venture & Investment Notes', 'Market theses, AI operating leverage, founder patterns, and venture durability.'],
  ['India Execution', 'ODC, BOT, GCC, offshore teams, BPO/HIL operations, and delivery scaling.'],
  ['Leadership Notes', 'Courage, ownership, responsibility, ambiguity, and capability building.'],
  ['The Human Side', 'Selected essays that connect professional life with meaning, literature, service, and inward work.'],
];

export default function Insights() {
  const sections = siteContent.pages.insights.sections;

  return (
    <div>
      {sections.map((section) => (
        <PageHero key={section.id} section={section} />
      ))}

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Featured Essays</div>
          <h2 className="section-title">A curated index, not archive clutter.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featuredEssays.map(([title, reason]) => (
              <article key={title} className="surface-card card-hover">
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-yellow-200">TheValluru.com / External</p>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-blue-100">{reason}</p>
                <button className="mt-5 text-sm font-semibold text-yellow-200">Read article</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Categories</div>
          <h2 className="section-title">Organized by theme, not only by date.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(([category, description]) => (
              <div key={category} className="surface-card">
                <h3 className="font-bold text-white">{category}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
