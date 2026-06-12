import { Link } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState } from 'react';
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

export default function HeroSection({ section }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = section.media?.url && !imageFailed;
  const proofPoints = ['Build', 'Back', 'Scale', 'Govern'];
  const backgroundVideo = section.backgroundVideo || '/hero-background.mp4';

  return (
    <section className="relative flex sm:min-h-[calc(100vh-80px)] items-center overflow-hidden bg-transparent py-2 sm:py-4 md:py-8">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      <div className="container-custom relative z-10 grid items-center gap-0 sm:gap-2 md:gap-8 lg:grid-cols-2">
        <div className="space-y-2 sm:space-y-4">
          <div className="text-sm font-semibold uppercase tracking-widest text-[var(--gold)]">{section.eyebrow}</div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-black sm:text-5xl md:text-6xl">{section.title}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-700 sm:text-xl">{section.body}</p>
          {section.supporting && (
            <p className="max-w-2xl border-l-4 border-[var(--gold)] pl-5 text-base leading-relaxed text-gray-700 sm:text-lg">
              {section.supporting}
            </p>
          )}

          <div className="grid max-w-2xl grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {proofPoints.map((point) => (
              <div key={point} className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-center">
              <p className="text-sm font-bold text-gray-800">{point}</p>
            </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            {renderCta(section.primaryCta, 'btn-primary')}
            {renderCta(section.secondaryCta, 'btn-secondary')}
            {renderCta(section.tertiaryCta, 'btn-warm')}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          {showImage ? (
            <div className="w-[min(80vw,20rem)] h-[min(80vw,20rem)] sm:w-[min(90vw,28rem)] sm:h-[min(90vw,28rem)] lg:w-[30rem] lg:h-[30rem] overflow-hidden rounded-full">
              <img
                src="./src/assets/Movement 3.png"
                alt={section.media.alt || section.title}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="flex w-[min(90vw,28rem)] h-[min(90vw,28rem)] flex-col items-center justify-center rounded-full border border-[var(--gold)]/30 bg-transparent p-4 sm:p-6 lg:p-8 text-center lg:w-[30rem] lg:h-[30rem]">
              <div className="mb-5 h-24 w-24 rounded-lg bg-transparent"></div>
              <p className="text-lg font-bold text-white">Your image goes here</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--warm-white)]">
                Save your portrait as public/sasidhar-valluru.jpg.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
