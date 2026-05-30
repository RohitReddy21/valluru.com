import PageHero from '../components/PageHero';
import { siteContent } from '../data/content';

const engagementTypes = [
  ['Investment Conversation', 'You are building or operating a venture where Sasi can add capital, architecture, execution, or governance value.'],
  ['Executive Advisory', 'You need a thinking partner across AI, product, delivery, PMO, offshore execution, or operating model.'],
  ['AI Architecture Review', 'You need to move AI from demo to production.'],
  ['PMO / Delivery Governance', 'You need delivery discipline, ownership, release rhythm, and executive visibility.'],
  ['India ODC / BOT', 'You need offshore leverage with operating control.'],
  ['Operating Transformation', 'You need workflow redesign, automation path, cost-to-serve reduction, or governance redesign.'],
  ['Partnership', 'You want to explore channel, venture, platform, or services collaboration.'],
];

const formFields = [
  { label: 'Name', name: 'name', type: 'text', placeholder: 'Basic identity' },
  { label: 'Company', name: 'company', type: 'text', placeholder: 'Context' },
  { label: 'Role', name: 'role', type: 'text', placeholder: 'Founder / CTO / Investor / Product / Enterprise / Partner' },
  { label: 'Email', name: 'email', type: 'email', placeholder: 'Primary contact' },
  { label: 'Conversation Type', name: 'conversationType', type: 'text', placeholder: 'Advisory / Investment / Partnership / Execution Support' },
  { label: 'Business Problem', name: 'businessProblem', type: 'textarea', placeholder: 'What needs to be solved' },
  { label: 'Current Stage', name: 'currentStage', type: 'text', placeholder: 'Idea / pilot / production / scaling / turnaround' },
  { label: 'Desired Outcome', name: 'desiredOutcome', type: 'textarea', placeholder: 'What success looks like' },
  { label: 'Timeline', name: 'timeline', type: 'text', placeholder: 'Urgency and decision horizon' },
  { label: 'Links', name: 'links', type: 'url', placeholder: 'Company website, LinkedIn, deck, article, or relevant material' },
];

export default function Contact() {
  const sections = siteContent.pages.contact.sections;

  return (
    <div>
      {sections.map((section) => (
        <PageHero key={section.id} section={section} />
      ))}

      <section className="dark-section">
        <div className="container-custom">
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">Engagement Types</div>
          <h2 className="section-title">Choose the conversation that fits the problem.</h2>
          <p className="section-copy mt-6">
            This page is for serious advisory, investment, partnership, or operating conversations.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {engagementTypes.map(([title, body]) => (
              <div key={title} className="surface-card card-hover">
                <h3 className="mb-3 text-lg font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-blue-100">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dark-section">
        <div className="container-custom">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-yellow-200">What to Include</div>
            <h2 className="section-title">Start a working conversation.</h2>
            <p className="section-copy mt-6">
              The form is for a serious advisory, investment, partnership, or operating conversation. The strongest inbound includes context, the business problem, current stage, desired outcome, timeline, and any useful links.
            </p>
            <form className="mt-10 rounded-2xl border border-blue-800 bg-blue-900/70 p-4 shadow-2xl shadow-blue-950/30 sm:p-6 lg:p-8">
              <div className="grid gap-5 md:grid-cols-2">
                {formFields.map((field) => (
                  <label key={field.name} className="field-card block">
                    <span className="mb-3 block text-base font-bold text-white">{field.label}</span>

                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full resize-y rounded-md border border-blue-700 bg-blue-950 px-4 py-3 text-white outline-none transition placeholder:text-blue-200 focus:border-yellow-200"
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full rounded-md border border-blue-700 bg-blue-950 px-4 py-3 text-white outline-none transition placeholder:text-blue-200 focus:border-yellow-200"
                      />
                    )}
                  </label>
                ))}
              </div>
              <button type="submit" className="btn-warm mt-6 w-full sm:w-auto">
                Start a Working Conversation
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
