import PageHero from '../components/PageHero';
import TextFlowSection from '../components/TextFlowSection';
import { siteContent } from '../data/content';

const backgroundAreas = [
  'Enterprise platforms',
  'AI-enabled systems',
  'Utility and energy workflows',
  'BPO operations',
  'India delivery',
  'Offshore execution',
  'Product and delivery governance',
  'Executive advisory',
  'Venture building',
];

const engines = [
  { title: 'The Builder', body: 'I build systems, products, teams, documents, operating models, AI architectures, paintings, and physical forms. Floating abstraction is not enough. It must become a thing.' },
  { title: 'The Performer', body: 'I think in scenes, rhythm, contrast, timing, and impact. A point should not merely be said. It should land.' },
  { title: 'The Strategist', body: 'I think in consequence. People, money, process, technology, risk, second-order effects, and failure modes all matter.' },
  { title: 'The Servant', body: 'I believe service must have hands. Cook. Feed. Support. Build. Protect. No theatre. No halo management.' },
];

const leadershipPath = [
  'Build the Self',
  'Build the Few',
  'Build the Team',
  'Build the Community',
  'Build the Institution',
  'Create Leaders Who Create Leaders',
];

export default function About() {
  const sections = siteContent.pages.about.sections;

  return (
    <div>
      {sections.map((section) => {
        if (section.type === 'page-hero') return <PageHero key={section.id} section={section} />;
        if (section.type === 'text-flow') return <TextFlowSection key={section.id} section={section} />;
        return null;
      })}

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Builder / Operator Background</div>
          <h2 className="section-title">A systems person, not only a manager.</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <p className="text-xl leading-relaxed text-blue-100">
              I look at product, delivery, engineering, operations, risk, field reality, customer pain, architecture, cost, compliance, and team capability as one connected organism. The common thread is operating judgment.
            </p>
            <div className="surface-card">
              <div className="grid gap-3 sm:grid-cols-2">
                {backgroundAreas.map((area) => (
                  <div key={area} className="rounded-lg border border-blue-800 bg-blue-950 px-4 py-3 text-sm font-semibold text-blue-100">
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">How I Think</div>
          <h2 className="section-title">The idea must become a working, repeatable, governable thing.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {['Problem', 'Workflow', 'System Behavior', 'Output', 'Exception Path', 'Ownership', 'Governance', 'Decision'].map((step, idx) => (
              <div key={step} className="surface-card">
                <div className="number-badge mb-4">{idx + 1}</div>
                <h3 className="font-bold text-white">{step}</h3>
              </div>
            ))}
          </div>
          <p className="section-copy mt-10">
            I do not like work that exists only as a slide. That is why I care about workflows, controls, handoffs, data, reporting, edge cases, ownership, and decisions.
          </p>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">The Four Engines</div>
          <h2 className="section-title">Craft + Courage + Consequence + Compassion.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {engines.map((engine) => (
              <div key={engine.title} className="surface-card card-hover">
                <h3 className="mb-3 text-xl font-bold text-white">{engine.title}</h3>
                <p className="text-sm leading-relaxed text-blue-100">{engine.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom grid gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Leadership and Legacy</div>
            <h2 className="section-title">Build the self. Build the few. Build the many.</h2>
            <p className="section-copy mt-6">
              I do not separate building companies from building people. The real legacy is the formation of capable, courageous, responsible human beings. A leader who creates dependency has failed. A leader who creates other leaders has done the work.
            </p>
          </div>
          <div className="surface-card">
            <div className="space-y-4">
              {leadershipPath.map((item, idx) => (
                <div key={item} className="flex items-center gap-4">
                  <span className="number-badge">{idx + 1}</span>
                  <span className="font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm font-semibold text-blue-950">
              The goal is not worship. The goal is formation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
