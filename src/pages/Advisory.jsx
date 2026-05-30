import PageHero from '../components/PageHero';
import { siteContent } from '../data/content';

const advisoryLanes = [
  {
    lane: 'Executive Advisory',
    problem: 'Leadership needs a thinking partner across AI, product, delivery, and scale.',
    work: 'Decision support, operating model review, roadmap review, investment thesis, and architecture critique.',
    output: 'Decision memo, roadmap, operating model, architecture review, or governance plan.',
  },
  {
    lane: 'Applied AI Systems',
    problem: 'AI pilots are not production-ready.',
    work: 'Model deployment review, edge/cloud design, HITL workflow, data boundary, alert logic, observability, and auditability.',
    output: 'AI operating model, deployment architecture, governance plan, and rollout roadmap.',
  },
  {
    lane: 'Product & Platform Architecture',
    problem: 'Product ambition lacks buildable detail.',
    work: 'BRD/PRD structure, workflows, data flows, system behavior, exception paths, and roadmap sequencing.',
    output: 'Product architecture, PRD/BRD framework, workflow schematic, and implementation plan.',
  },
  {
    lane: 'PMO & Delivery Governance',
    problem: 'Delivery is noisy, late, or hard to trust.',
    work: 'Ownership model, release rhythm, status reporting, escalation path, KPI model, and decision forums.',
    output: 'PMO operating model, governance cadence, RACI, and dashboard structure.',
  },
  {
    lane: 'India ODC / BOT Execution',
    problem: 'Offshore leverage exists, but control is weak.',
    work: 'Team model, hiring structure, delivery cadence, vendor governance, transition control, and quality systems.',
    output: 'ODC/BOT blueprint, staffing model, governance model, and transition roadmap.',
  },
  {
    lane: 'Operational Transformation',
    problem: 'Processes are manual, fragmented, or costly.',
    work: 'Current-state mapping, gap analysis, workflow redesign, automation path, controls, and reporting.',
    output: 'Transformation roadmap, workflow design, controls, savings, and execution path.',
  },
];

const engagementSteps = [
  'Context',
  'Problem Definition',
  'Current-State Mapping',
  'Gap Separation',
  'Target Operating Model',
  'Execution Roadmap',
  'Governance',
  'Decision / Action',
];

const gapTypes = [
  ['Process gap', 'The work is not flowing cleanly.'],
  ['Data gap', 'The inputs or truth sources are weak.'],
  ['Product gap', 'The system does not support the workflow.'],
  ['Ownership gap', 'No one owns the outcome or exception.'],
  ['Governance gap', 'Decisions, escalations, controls, and reporting are weak.'],
  ['Capability gap', 'The team lacks skill, structure, or judgment.'],
];

export default function Advisory() {
  const sections = siteContent.pages.advisory.sections;

  return (
    <div>
      {sections.map((section) => (
        <PageHero key={section.id} section={section} />
      ))}

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Opening Frame</div>
          <h2 className="section-title">High-leverage intervention, not commodity consulting.</h2>
          <p className="section-copy mt-6">
            The work is usually not about producing another deck. It is about clarifying the problem, designing the operating model, defining system behavior, assigning ownership, sequencing execution, creating governance, and helping teams move.
          </p>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Advisory Lanes</div>
          <h2 className="section-title">Every lane produces a useful output.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {advisoryLanes.map((lane) => (
              <article key={lane.lane} className="surface-card card-hover">
                <h3 className="mb-4 text-xl font-bold text-white">{lane.lane}</h3>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p><span className="font-bold text-yellow-200">Buyer problem: </span><span className="text-blue-100">{lane.problem}</span></p>
                  <p><span className="font-bold text-yellow-200">Work performed: </span><span className="text-blue-100">{lane.work}</span></p>
                  <p><span className="font-bold text-yellow-200">Output: </span><span className="text-blue-100">{lane.output}</span></p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">How Engagements Usually Work</div>
          <h2 className="section-title">Every engagement begins with clarity.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {engagementSteps.map((step, idx) => (
              <div key={step} className="surface-card">
                <div className="number-badge mb-4">{idx + 1}</div>
                <p className="font-bold text-white">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gapTypes.map(([type, meaning]) => (
              <div key={type} className="surface-card">
                <h3 className="font-bold text-white">{type}</h3>
                <p className="mt-2 text-sm text-blue-100">{meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
