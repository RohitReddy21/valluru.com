export default function TextFlowSection({ section }) {
  return (
    <section className="dark-section">
      <div className="container-custom">
        <div className="eyebrow mb-4">{section.eyebrow}</div>
        <h2 className="section-title">{section.title}</h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xl leading-relaxed text-[#6B7A99]">{section.body}</p>
          </div>

          <div className="surface-card">
            <ul className="space-y-3">
              {section.bullets?.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C9A84C]"></span>
                  <span className="text-[#0B1120]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
