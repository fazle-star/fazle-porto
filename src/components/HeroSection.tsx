import { Github, Globe, Terminal } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

interface HeroSectionProps {
  heroVisible: boolean;
  onExploreWork: () => void;
  onSecuritySection: () => void;
  onEnterPortal: () => void;
}

export function HeroSection({
  heroVisible,
  onExploreWork,
  onSecuritySection,
  onEnterPortal,
}: HeroSectionProps) {
  const lineClass = (extra = '') =>
    `hero-line-reveal ${heroVisible ? 'hero-line-reveal--visible' : ''} ${extra}`.trim();

  return (
    <section
      id="home"
      className="relative min-h-screen md:h-screen md:min-h-[680px] overflow-hidden flex flex-col justify-between pt-[76px] md:pt-[68px]"
    >
      {/* Swiss-Editorial Oversized Masked Line-by-Line Flanking Typography */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-5 md:pt-0 md:my-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
        {/* Left Side (Desktop) / Top-Left (Mobile) */}
        <div className="md:max-w-[360px] lg:max-w-[460px]">
          <span className="hero-line-mask mb-2 md:mb-3">
            <span
              className={lineClass(
                'text-xs sm:text-sm font-mono font-medium tracking-[0.18em] uppercase text-[#E2B86B]'
              )}
              style={{ transitionDelay: '60ms' }}
            >
              Hello, I&apos;m
            </span>
          </span>

          <h1
            className="font-display font-semibold text-[#F3F4F6] tracking-[-0.03em] leading-[0.96]"
            style={{
              fontSize: 'clamp(2.35rem, 4.7vw, 4.65rem)',
            }}
          >
            <span className="hero-line-mask">
              <span className={lineClass()} style={{ transitionDelay: '130ms' }}>
                Muhammad
              </span>
            </span>
            <span className="hero-line-mask">
              <span className={lineClass()} style={{ transitionDelay: '210ms' }}>
                <span className="text-[#E2B86B]">Fazle</span> Ferino
              </span>
            </span>
          </h1>
        </div>

        {/* Right Side (Desktop) / Below Name (Mobile) */}
        <div className="md:text-right md:max-w-[350px] lg:max-w-[440px]">
          <span className="hero-line-mask mb-2 md:mb-3">
            <span
              className={lineClass(
                'text-xs sm:text-sm font-mono font-medium tracking-[0.18em] uppercase text-[rgba(243,244,246,0.72)]'
              )}
              style={{ transitionDelay: '160ms' }}
            >
              Cybersecurity &amp;
            </span>
          </span>

          <p
            className="font-display font-semibold tracking-[-0.025em] leading-[0.98]"
            style={{
              fontSize: 'clamp(1.75rem, 3.55vw, 3.55rem)',
            }}
          >
            <span className="hero-line-mask">
              <span
                className={lineClass('text-[#E2B86B]')}
                style={{ transitionDelay: '240ms' }}
              >
                Full-Stack
              </span>
            </span>
            <span className="hero-line-mask">
              <span
                className={lineClass('text-[#F3F4F6]')}
                style={{ transitionDelay: '320ms' }}
              >
                Developer
              </span>
            </span>
          </p>
        </div>
      </div>

      {/* Center Cutout Portrait + Champagne Gold Shoulder Backlight */}
      <div className="relative md:absolute md:bottom-0 md:left-1/2 md:-translate-x-1/2 z-10 w-full md:w-auto flex items-end justify-center mt-auto pointer-events-none">
        {/* Soft Circular Champagne Gold Radial Glow behind portrait shoulders */}
        <div
          aria-hidden="true"
          data-testid="hero-backlight-glow"
          className="hero-portrait-backlight absolute top-[20%] left-1/2 -translate-x-1/2 w-[260px] h-[260px] sm:w-[310px] sm:h-[310px] md:w-[370px] md:h-[370px] lg:w-[420px] lg:h-[420px] rounded-full pointer-events-none"
        />

        {/* Bottom-to-Top Entrance Wrapper triggered when Preloader curtain lifts */}
        <div
          data-testid="hero-portrait-wrapper"
          className={`hero-portrait-entrance relative z-10 flex items-end justify-center ${
            heroVisible ? 'hero-portrait-entrance--visible' : ''
          }`}
        >
          <img
            src={PORTFOLIO_DATA.identity.portraitCutout}
            alt="Muhammad Fazle Ferino studio cutout portrait"
            data-testid="hero-cutout-portrait"
            referrerPolicy="no-referrer"
            className="hero-portrait-mask h-[44vh] min-h-[290px] max-h-[385px] md:h-[73vh] md:min-h-[450px] lg:h-[78vh] lg:max-h-[700px] w-auto object-contain select-none"
          />
        </div>
      </div>

      {/* Bottom-Left: Minimal Vertical Social / Portfolio Icons */}
      <div
        aria-label="Quick profile and section shortcuts"
        className="absolute bottom-24 left-4 md:bottom-10 md:left-8 lg:left-12 z-30 flex flex-col items-center gap-2.5"
      >
        <a
          href={PORTFOLIO_DATA.identity.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub fazle-star"
          title="GitHub — fazle-star"
          data-testid="hero-icon-github"
          className="w-10 h-10 rounded-full border border-[rgba(226,184,107,0.22)] bg-[#151821]/75 flex items-center justify-center text-[#F3F4F6]/80 hover:text-[#E2B86B] hover:border-[#E2B86B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B]"
        >
          <Github className="w-4 h-4" aria-hidden="true" />
        </a>

        <button
          type="button"
          onClick={onExploreWork}
          aria-label="Jump to Web Development Projects"
          title="Featured Web Projects"
          data-testid="hero-icon-web"
          className="w-10 h-10 rounded-full border border-[rgba(226,184,107,0.22)] bg-[#151821]/75 flex items-center justify-center text-[#F3F4F6]/80 hover:text-[#E2B86B] hover:border-[#E2B86B] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B]"
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onSecuritySection}
          aria-label="Jump to Cybersecurity and CTF Terminal Focus"
          title="Cybersecurity & CTF"
          data-testid="hero-icon-terminal"
          className="w-10 h-10 rounded-full border border-[rgba(226,184,107,0.22)] bg-[#151821]/75 flex items-center justify-center text-[#F3F4F6]/80 hover:text-[#E2B86B] hover:border-[#E2B86B] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B]"
        >
          <Terminal className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Bottom-Right: Minimal Scroll Indicator */}
      <button
        type="button"
        onClick={onEnterPortal}
        data-testid="hero-scroll-indicator"
        className="absolute bottom-24 right-4 md:bottom-10 md:right-8 lg:right-12 z-30 inline-flex items-center gap-2 py-2 px-1 text-[10px] sm:text-xs font-mono font-medium tracking-[0.16em] uppercase text-[#E2B86B] hover:text-[#f3d18d] transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B]"
      >
        <span>SCROLL TO EXPLORE</span>
        <span aria-hidden="true">↓</span>
      </button>
    </section>
  );
}
