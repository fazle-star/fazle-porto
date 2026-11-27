import { useState } from 'react';
import { Camera } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export function WhoIsFazleSection() {
  const [touchPaused, setTouchPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const marqueePhotos = [
    ...PORTFOLIO_DATA.whoIsFazle.gallery,
    ...PORTFOLIO_DATA.whoIsFazle.gallery,
  ];

  return (
    <section
      id="who-is-fazle"
      data-testid="who-is-fazle-section"
      className="relative z-20 bg-[#0B0D10]/82 py-24 md:py-32 border-t border-[rgba(226,184,107,0.14)] overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        {/* Editorial Intro & Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E2B86B] tabular-nums mb-3">
              02 / Identity
            </p>
            <h2
              className="font-display font-semibold text-[#F3F4F6] tracking-tight leading-tight"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', textWrap: 'balance' }}
            >
              {PORTFOLIO_DATA.whoIsFazle.title}
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-sm md:text-base font-medium text-[#E2B86B] mb-2">
              {PORTFOLIO_DATA.whoIsFazle.headline}
            </p>
            <p className="text-sm md:text-base text-[rgba(243,244,246,0.78)] leading-relaxed">
              {PORTFOLIO_DATA.whoIsFazle.narrative}
            </p>
          </div>
        </div>

        {/* Quick Biodata Grid */}
        <div
          data-testid="biodata-grid"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {PORTFOLIO_DATA.whoIsFazle.biodata.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-[#151821] border border-[rgba(226,184,107,0.22)] px-4 py-4"
            >
              <span className="block text-xs text-[rgba(243,244,246,0.62)] mb-1">
                {item.label}
              </span>
              <span className="block text-sm md:text-[15px] font-semibold text-[#F3F4F6]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite Auto-Scrolling Photo Gallery (pauses on hover/touch) */}
      <div
        data-testid="bio-photo-marquee"
        className="bio-marquee-container relative w-full overflow-hidden py-3 mb-14"
        onTouchStart={() => setTouchPaused(true)}
        onTouchEnd={() => setTouchPaused(false)}
        onTouchCancel={() => setTouchPaused(false)}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-24 z-10 bg-gradient-to-r from-[#0B0D10] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-24 z-10 bg-gradient-to-l from-[#0B0D10] to-transparent"
        />

        <div
          className="bio-marquee-track gap-5 px-4"
          style={touchPaused ? { animationPlayState: 'paused' } : undefined}
        >
          {marqueePhotos.map((photo, index) => {
            const isDuplicate = index >= PORTFOLIO_DATA.whoIsFazle.gallery.length;
            const hasFailed = Boolean(failedImages[photo.id]);
            return (
              <figure
                key={`${photo.id}-${index}`}
                aria-hidden={isDuplicate}
                className="relative w-[270px] sm:w-[320px] md:w-[360px] aspect-[4/3] shrink-0 rounded-2xl overflow-hidden border border-[rgba(226,184,107,0.28)] bg-[#151821] group"
              >
                {hasFailed ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#151821] to-[#0B0D10]">
                    <Camera className="w-7 h-7 text-[#E2B86B] mb-2" aria-hidden="true" />
                    <span className="text-xs font-medium text-[#F3F4F6]">{photo.caption}</span>
                  </div>
                ) : (
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [photo.id]: true }))
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
                <figcaption className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-[#0B0D10]/90 via-[#0B0D10]/55 to-transparent text-xs font-medium text-[#F3F4F6]/90">
                  {photo.caption}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {/* 3 Pillar Cards */}
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div
          data-testid="bio-pillars-grid"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PORTFOLIO_DATA.whoIsFazle.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl bg-[#151821] border border-[rgba(226,184,107,0.22)] p-6 md:p-7 flex flex-col justify-between"
            >
              <div>
                <span className="block font-display text-xs font-semibold text-[#E2B86B] tabular-nums mb-3">
                  {pillar.number}
                </span>
                <h3 className="font-display text-xl font-semibold text-[#F3F4F6] mb-2.5">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[rgba(243,244,246,0.74)] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
