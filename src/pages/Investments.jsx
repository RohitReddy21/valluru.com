import PageHero from '../components/PageHero';
import { siteContent } from '../data/content';

const ventureCards = [
  {
    company: 'TechJignayasa / TechJignyasa',
    sector: 'AI adoption, platform engineering, India execution',
    role: 'Operating company / venture platform',
    thesis: 'Many companies want AI transformation. Few have the operating structure to deploy it.',
    operatingRole: 'AI solution blueprints, platform engineering, India ODC/GCC execution, BPO/HIL delivery, application AI, workflow automation, and delivery governance.',
    link: 'More soon',
  },
  {
    company: 'PrimeVerse',
    sector: 'Venture / investment platform',
    role: 'Active venture and investment portfolio',
    thesis: 'Public positioning should be finalized based on current operating scope, market, and business problem.',
    operatingRole: 'Define market served, technology role, operating model, investment thesis, and why the venture belongs in the portfolio.',
    link: 'More soon',
  },
  {
    company: 'VipasEnergy',
    sector: 'Energy and utility management',
    role: 'Portfolio venture',
    thesis: 'Energy management is becoming a data, compliance, cost, and operating-intelligence problem.',
    operatingRole: 'Utility expense management, greenhouse gas reporting, outsourced bill payment, analytics, tariff optimization, and enterprise workflow support.',
    link: 'More soon',
  },
];

const themes = [
  ['Applied AI', 'AI must move from demo to governed operating system.'],
  ['Vertical AI', 'Domain-specific workflows will create deeper advantage than generic tools.'],
  ['Security AI', 'Real-world AI must combine hardware, software, edge/cloud architecture, and response workflows.'],
  ['Energy and Utility Management', 'Energy is becoming a data, compliance, and optimization problem.'],
  ['India ODC / BOT Models', 'India execution can create leverage when governance is designed correctly.'],
  ['BPO / Human-in-the-Loop Operations', 'AI still needs human judgment, validation, labeling, escalation, and exception handling.'],
  ['MSME AI Adoption', 'Small and mid-sized businesses need practical AI workflows, not enterprise theatre.'],
  ['Enterprise Workflow Automation', 'Workflow depth is often a better moat than UI polish.'],
];

export default function Investments() {
  const sections = siteContent.pages.investments.sections;

  return (
    <div>
      {sections.map((section) => (
        <PageHero key={section.id} section={section} />
      ))}

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Investment Thesis</div>
          <h2 className="section-title">Capital paired with execution.</h2>
          <p className="section-copy mt-6">
            I am most useful where capital needs to be paired with architecture, product thinking, delivery systems, India execution, AI adoption, operating governance, executive narrative, and leadership formation.
          </p>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Ventures and Portfolio</div>
          <h2 className="section-title">Not a passive logo wall.</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {ventureCards.map((venture) => (
              <article key={venture.company} className="surface-card card-hover">
                <h3 className="mb-2 text-2xl font-bold text-white">{venture.company}</h3>
                <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-yellow-200">{venture.sector}</p>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="font-bold text-yellow-200">Role</dt>
                    <dd className="text-blue-100">{venture.role}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-yellow-200">Thesis</dt>
                    <dd className="text-blue-100">{venture.thesis}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-yellow-200">Operating Role</dt>
                    <dd className="text-blue-100">{venture.operatingRole}</dd>
                  </div>
                </dl>
                <p className="mt-6 rounded-lg bg-yellow-50 px-4 py-3 text-sm font-semibold text-blue-950">{venture.link}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Future Investment Areas</div>
          <h2 className="section-title">Ventures where technology improves operating leverage.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {themes.map(([theme, why]) => (
              <div key={theme} className="surface-card">
                <h3 className="font-bold text-white">{theme}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">{why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
