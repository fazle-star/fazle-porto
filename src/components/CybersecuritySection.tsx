import { PORTFOLIO_DATA } from '../data/portfolio';

export function CybersecuritySection() {
  return (
    <section
      id="cybersecurity"
      className="relative z-20 bg-[#151821] py-24 md:py-32 px-5 md:px-8 border-t border-[rgba(226,184,107,0.14)]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E2B86B] tabular-nums mb-3">
            04 / Security
          </p>
          <h2
            className="font-display font-semibold text-[#F3F4F6] tracking-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', textWrap: 'balance' }}
          >
            {PORTFOLIO_DATA.cybersecurity.title}
          </h2>
          <p className="text-sm md:text-base text-[rgba(243,244,246,0.72)] leading-relaxed">
            Applying offensive reconnaissance and defensive engineering practices to build applications that hold up under real threat models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Focus Areas */}
          <div className="lg:col-span-7">
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[rgba(243,244,246,0.62)] mb-5">
              Focus Disciplines
            </h3>

            <div className="divide-y divide-[rgba(226,184,107,0.16)] border-y border-[rgba(226,184,107,0.16)]">
              {PORTFOLIO_DATA.cybersecurity.focus.map((item, idx) => (
                <div key={item.title} className="py-5 flex items-start gap-5">
                  <span className="font-display text-sm font-semibold text-[#E2B86B] tabular-nums pt-0.5 shrink-0">
                    0{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-display text-lg md:text-xl font-semibold text-[#F3F4F6] mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[rgba(243,244,246,0.68)] leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Lab Environment & Tooling */}
          <div className="lg:col-span-5">
            <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-[rgba(243,244,246,0.62)] mb-5">
              Lab & Tooling Stack
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {PORTFOLIO_DATA.cybersecurity.tools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl bg-[#0B0D10] border border-[rgba(226,184,107,0.22)] px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-display text-base font-semibold text-[#F3F4F6]">
                      {tool.name}
                    </p>
                    <p className="text-xs text-[rgba(243,244,246,0.62)] mt-0.5">
                      {tool.role}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rotate-45 border border-[#E2B86B] shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
