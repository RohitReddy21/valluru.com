import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function HeroSection({ section }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = section.media?.url && !imageFailed;
  const proofPoints = ['Build', 'Back', 'Scale', 'Govern'];

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center bg-blue-950 py-16 sm:py-20">
      <div className="container-custom grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="text-sm font-semibold uppercase tracking-widest text-yellow-200">{section.eyebrow}</div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">{section.title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">{section.body}</p>
          {section.supporting && (
            <p className="max-w-2xl border-l-4 border-yellow-300 pl-5 text-base leading-relaxed text-blue-100 sm:text-lg">
              {section.supporting}
            </p>
          )}

          <div className="grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {proofPoints.map((point) => (
              <div key={point} className="rounded-lg border border-blue-800 bg-blue-900/80 px-4 py-3 text-center">
                <p className="text-sm font-bold text-white">{point}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {section.primaryCta && (
              <Link to={section.primaryCta.href} className="btn-primary">
                {section.primaryCta.label}
              </Link>
            )}
            {section.secondaryCta && (
              <Link to={section.secondaryCta.href} className="btn-secondary">
                {section.secondaryCta.label}
              </Link>
            )}
            {section.tertiaryCta && (
              <Link to={section.tertiaryCta.href} className="btn-warm">
                {section.tertiaryCta.label}
              </Link>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          {showImage ? (
            <div className="aspect-square w-[min(78vw,28rem)] overflow-hidden rounded-full border border-blue-800 bg-blue-900 shadow-2xl shadow-blue-950/50 lg:w-[30rem]">
              <img
                src={section.media.url}
                alt={section.media.alt || section.title}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-square w-[min(78vw,28rem)] flex-col items-center justify-center rounded-full border border-blue-800 bg-blue-900 p-8 text-center shadow-2xl shadow-blue-950/40 lg:w-[30rem]">
              <div className="mb-5 h-24 w-24 rounded-full border border-yellow-200 bg-blue-950"></div>
              <p className="text-lg font-bold text-white">Your image goes here</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-blue-100">
                Save your portrait as public/sasidhar-valluru.jpg.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
