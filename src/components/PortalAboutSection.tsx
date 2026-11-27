import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA, type TechItem } from '../data/portfolio';
import {
  computeDualPortalMetrics,
  computePortalProgress,
  type PortalId,
} from '../utils/portfolioEngine';

interface PortalAboutSectionProps {
  portalVelocityRef: React.RefObject<number>;
  activePortal: PortalId;
  onSelectActivePortal: (portal: PortalId) => void;
  selectedTech: string | null;
  onSelectTech: (tech: string | null) => void;
  onFilterProjectsByTech: (tech: string) => void;
  onNavigateToSection: (sectionId: string) => void;
}

export function PortalAboutSection({
  portalVelocityRef,
  activePortal,
  onSelectActivePortal,
  selectedTech,
  onSelectTech,
  onFilterProjectsByTech,
  onNavigateToSection,
}: PortalAboutSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileRailRef = useRef<HTMLDivElement | null>(null);
  const workspacePortalRef = useRef<HTMLDivElement | null>(null);
  const workspacePreviewRef = useRef<HTMLDivElement | null>(null);
  const workspaceInnerRef = useRef<HTMLDivElement | null>(null);

  const bioPortalRef = useRef<HTMLDivElement | null>(null);
  const bioPreviewRef = useRef<HTMLDivElement | null>(null);
  const bioInnerRef = useRef<HTMLDivElement | null>(null);
  const mobileCueRef = useRef<HTMLButtonElement | null>(null);

  const activePortalRef = useRef<PortalId>(activePortal);
  activePortalRef.current = activePortal;

  const [portalProgress, setPortalProgress] = useState(0);
  const [isZoomedInteractive, setIsZoomedInteractive] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [activeTechItem, setActiveTechItem] = useState<TechItem>(
    PORTFOLIO_DATA.about.techStack[4]
  );

  useEffect(() => {
    if (selectedTech) {
      const found = PORTFOLIO_DATA.about.techStack.find(
        (t) => t.name.toLowerCase() === selectedTech.toLowerCase()
      );
      if (found) setActiveTechItem(found);
    }
  }, [selectedTech]);

  // Keep mobile horizontal snap rail synced when activePortal changes programmatically
  const scrollMobileRailTo = (portal: PortalId) => {
    onSelectActivePortal(portal);
    const rail = mobileRailRef.current;
    if (!rail) return;
    const targetLeft = portal === 'workspace' ? 0 : rail.clientWidth;
    rail.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let scheduled = false;
    let lastProgress = -1;
    let lastActive: PortalId = activePortalRef.current;
    let lastTime = performance.now();
    let decayTimer: number | undefined;

    const applyMetrics = (force = false) => {
      scheduled = false;
      const now = performance.now();
      const track = trackRef.current;
      const wPortal = workspacePortalRef.current;
      const wPreview = workspacePreviewRef.current;
      const wInner = workspaceInnerRef.current;
      const bPortal = bioPortalRef.current;
      const bPreview = bioPreviewRef.current;
      const bInner = bioInnerRef.current;

      if (!track || !wPortal || !wPreview || !wInner || !bPortal || !bPreview || !bInner) {
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      setIsMobileViewport((prev) => (prev !== mobile ? mobile : prev));

      const rect = track.getBoundingClientRect();
      const progress = computePortalProgress(rect.top, rect.height, vh);
      const currentActive = activePortalRef.current;

      if (force || progress !== lastProgress || currentActive !== lastActive) {
        const dt = Math.max(16, now - lastTime);
        const scrollDelta = Math.abs(progress - (lastProgress < 0 ? progress : lastProgress));
        const velocity = lastProgress < 0 ? 0 : Math.min(1, (scrollDelta / dt) * 180);

        const wMetrics = computeDualPortalMetrics(
          progress,
          vw,
          vh,
          'workspace',
          currentActive,
          prefersReducedMotion
        );
        const bMetrics = computeDualPortalMetrics(
          progress,
          vw,
          vh,
          'bio',
          currentActive,
          prefersReducedMotion
        );

        const applyToSlot = (
          portalEl: HTMLDivElement,
          previewEl: HTMLDivElement,
          innerEl: HTMLDivElement,
          metrics: ReturnType<typeof computeDualPortalMetrics>
        ) => {
          portalEl.style.width = `${metrics.width}px`;
          portalEl.style.height = `${metrics.height}px`;
          portalEl.style.borderRadius = `${metrics.borderRadiusTop}px ${metrics.borderRadiusTop}px ${metrics.borderRadiusBottom}px ${metrics.borderRadiusBottom}px`;
          portalEl.style.borderColor =
            metrics.borderAlpha <= 0.01
              ? 'transparent'
              : `rgba(226, 184, 107, ${metrics.borderAlpha})`;
          portalEl.style.opacity = String(metrics.opacity);
          portalEl.style.visibility = metrics.opacity <= 0.01 ? 'hidden' : 'visible';

          if (mobile && progress < 0.04) {
            portalEl.style.transform = 'none';
          } else {
            portalEl.style.transform = `translate3d(${metrics.offsetX}px, 0, 0) scale(${metrics.scale})`;
          }

          portalEl.style.boxShadow =
            progress > 0.08
              ? 'none'
              : !metrics.isReceding
                ? '0 0 42px rgba(226, 184, 107, 0.18), 0 24px 60px rgba(0, 0, 0, 0.65)'
                : '0 16px 40px rgba(0, 0, 0, 0.45)';

          previewEl.style.opacity = String(metrics.previewOpacity);
          previewEl.style.transform = `scale(${metrics.previewScale})`;
          previewEl.style.visibility = metrics.previewOpacity <= 0.01 ? 'hidden' : 'visible';

          innerEl.style.opacity = String(metrics.innerOpacity);
          innerEl.style.transform = `scale(${metrics.innerScale})`;
          innerEl.style.visibility = metrics.innerOpacity <= 0.01 ? 'hidden' : 'visible';
        };

        applyToSlot(wPortal, wPreview, wInner, wMetrics);
        applyToSlot(bPortal, bPreview, bInner, bMetrics);

        if (mobileCueRef.current) {
          const cueOpacity = Math.max(0, 1 - progress * 8);
          mobileCueRef.current.style.opacity = String(cueOpacity);
          mobileCueRef.current.style.pointerEvents = cueOpacity > 0.1 ? 'auto' : 'none';
        }

        const activeInnerOpacity =
          currentActive === 'workspace' ? wMetrics.innerOpacity : bMetrics.innerOpacity;
        const interactive = activeInnerOpacity >= 0.6;
        setIsZoomedInteractive((prev) => (prev !== interactive ? interactive : prev));
        setPortalProgress((prev) => (Math.abs(prev - progress) > 0.01 ? progress : prev));

        if (progress > 0.05 && progress < 0.9) {
          portalVelocityRef.current = Math.max(Math.sin(progress * Math.PI) * 0.45, velocity);
        } else {
          portalVelocityRef.current = velocity;
        }

        lastProgress = progress;
        lastActive = currentActive;
        lastTime = now;

        if (decayTimer) window.clearTimeout(decayTimer);
        decayTimer = window.setTimeout(() => {
          portalVelocityRef.current = 0;
        }, 160);
      }
    };

    const scheduleUpdate = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = window.requestAnimationFrame(() => applyMetrics(false));
      }
    };

    const handleResize = () => applyMetrics(true);
    applyMetrics(true);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(rafId);
      if (decayTimer) window.clearTimeout(decayTimer);
    };
  }, [portalVelocityRef, activePortal]);

  const handleMobileRailScroll = () => {
    const rail = mobileRailRef.current;
    if (!rail || window.innerWidth >= 768) return;
    const isBioFocused = rail.scrollLeft >= rail.clientWidth * 0.45;
    const nextPortal: PortalId = isBioFocused ? 'bio' : 'workspace';
    if (nextPortal !== activePortal) {
      onSelectActivePortal(nextPortal);
    }
  };

  const renderReticleSvg = (variant: PortalId) => (
    <svg
      width="84"
      height="84"
      viewBox="0 0 112 112"
      fill="none"
      aria-hidden="true"
      className="mb-5 text-[#E2B86B]/75 shrink-0"
    >
      <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="56" cy="56" r="26" stroke="currentColor" strokeWidth="1" />
      {variant === 'workspace' ? (
        <>
          <line x1="56" y1="2" x2="56" y2="20" stroke="currentColor" strokeWidth="1.2" />
          <line x1="56" y1="92" x2="56" y2="110" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2" y1="56" x2="20" y2="56" stroke="currentColor" strokeWidth="1.2" />
          <line x1="92" y1="56" x2="110" y2="56" stroke="currentColor" strokeWidth="1.2" />
          <rect x="53" y="53" width="6" height="6" transform="rotate(45 56 56)" fill="#E2B86B" />
        </>
      ) : (
        <>
          <circle cx="56" cy="48" r="9" stroke="#E2B86B" strokeWidth="1.4" />
          <path
            d="M39 75C42.5 66.5 48.8 63 56 63C63.2 63 69.5 66.5 73 75"
            stroke="#E2B86B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );

  const inMobileSwipeMode = isMobileViewport && portalProgress < 0.04;
  const workspaceActive = activePortal === 'workspace';
  const bioActive = activePortal === 'bio';

  return (
    <section
      id="portal-track"
      ref={trackRef}
      aria-label="Dual 3D Workspace and Identity Portals"
      className="relative z-10"
      style={{ height: '280vh' }}
    >
      {/* Anchor sentinel placed at end-scroll position (180vh) */}
      <div
        id="about"
        aria-hidden="true"
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: '180vh', height: '100vh' }}
      />

      <div
        id="portal-sticky"
        className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      >
        {/* Desktop Dual Portal Selection Helper (subtle top hint before zoom starts) */}
        <div
          className="hidden md:flex items-center gap-6 mb-4 z-30 transition-opacity duration-200"
          style={{
            opacity: portalProgress < 0.08 ? 1 : 0,
            pointerEvents: portalProgress < 0.08 ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            onClick={() => onSelectActivePortal('workspace')}
            aria-pressed={workspaceActive}
            className={`text-xs font-medium tracking-[0.08em] uppercase transition-colors cursor-pointer pb-1 border-b ${
              workspaceActive
                ? 'text-[#E2B86B] border-[#E2B86B]'
                : 'text-[#F3F4F6]/60 border-transparent hover:text-[#F3F4F6]'
            }`}
          >
            01 · Workspace &amp; Stack
          </button>
          <span aria-hidden="true" className="text-[rgba(226,184,107,0.35)] text-xs">
            /
          </span>
          <button
            type="button"
            onClick={() => onSelectActivePortal('bio')}
            aria-pressed={bioActive}
            className={`text-xs font-medium tracking-[0.08em] uppercase transition-colors cursor-pointer pb-1 border-b ${
              bioActive
                ? 'text-[#E2B86B] border-[#E2B86B]'
                : 'text-[#F3F4F6]/60 border-transparent hover:text-[#F3F4F6]'
            }`}
          >
            02 · Who Is Fazle?
          </button>
        </div>

        {/* Portal Stage: Horizontally swipeable on Mobile at rest, Dual centered overlay on Desktop */}
        <div
          ref={mobileRailRef}
          onScroll={handleMobileRailScroll}
          data-testid="dual-portal-stage"
          className={
            inMobileSwipeMode
              ? 'w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar items-center'
              : 'relative w-full h-full flex items-center justify-center'
          }
        >
          {/* SLOT 01: ENTER THE WORKSPACE */}
          <div
            className={
              inMobileSwipeMode
                ? 'w-screen shrink-0 snap-center flex flex-col items-center justify-center px-4'
                : 'absolute inset-0 flex items-center justify-center pointer-events-none'
            }
          >
            <div
              id="mask-portal-workspace"
              data-testid="portal-card-workspace"
              ref={workspacePortalRef}
              onMouseEnter={() => {
                if (!isMobileViewport && portalProgress < 0.08) onSelectActivePortal('workspace');
              }}
              onClick={() => {
                if (portalProgress < 0.08) onSelectActivePortal('workspace');
              }}
              className="relative bg-[#151821] border-[1.5px] border-[#E2B86B] overflow-hidden flex items-center justify-center pointer-events-auto cursor-pointer"
              style={{
                width: '380px',
                height: '470px',
                borderRadius: '220px 220px 28px 28px',
                zIndex: workspaceActive ? 20 : 10,
              }}
            >
              {/* Outer Preview Face (01) */}
              <div
                ref={workspacePreviewRef}
                data-testid="portal-preview-workspace"
                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none"
              >
                {renderReticleSvg('workspace')}
                <span className="font-display text-2xl md:text-3xl font-semibold text-[#E2B86B] tabular-nums mb-2">
                  01
                </span>
                <p className="font-display text-base md:text-lg font-medium tracking-[0.12em] uppercase text-[#F3F4F6]">
                  01 — Enter the Workspace
                </p>
                <p className="mt-2.5 text-xs text-[rgba(243,244,246,0.65)] max-w-[230px] leading-relaxed">
                  Zooms into Featured Projects &amp; Core Tech Stack
                </p>
                <span
                  className={`mt-5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                    workspaceActive ? 'text-[#E2B86B]' : 'text-[#F3F4F6]/50'
                  }`}
                >
                  {workspaceActive ? 'Selected · Scroll to Zoom' : 'Click to Focus'}
                </span>
              </div>

              {/* Zoomed Interior: Section About & Tech Stack */}
              <div
                ref={workspaceInnerRef}
                data-testid="about-content"
                aria-hidden={!(isZoomedInteractive && workspaceActive)}
                onClick={(e) => e.stopPropagation()}
                className="w-screen max-w-[100vw] shrink-0 z-20 flex items-center justify-center px-5 md:px-8 pt-[76px] pb-[76px] md:py-16 cursor-default"
                style={{
                  opacity: 0,
                  transform: 'scale(0.8276)',
                  pointerEvents: isZoomedInteractive && workspaceActive ? 'auto' : 'none',
                }}
              >
                <div className="w-full max-w-5xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-10 items-start">
                    <div className="lg:col-span-6">
                      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E2B86B] tabular-nums mb-2 md:mb-3">
                        01 / Workspace
                      </p>
                      <h2
                        className="font-display font-semibold text-[#F3F4F6] tracking-tight leading-tight mb-2.5 md:mb-4"
                        style={{ fontSize: 'clamp(1.65rem, 3.5vw, 2.9rem)', textWrap: 'balance' }}
                      >
                        {PORTFOLIO_DATA.about.title}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-[#F3F4F6]/85 leading-relaxed mb-3.5 md:mb-5">
                        {PORTFOLIO_DATA.about.bio}
                      </p>

                      <div className="pt-3 md:pt-4 border-t border-[rgba(226,184,107,0.18)] grid grid-cols-2 gap-4 text-xs md:text-sm mb-4">
                        <div>
                          <span className="block text-[rgba(243,244,246,0.62)] mb-0.5 md:mb-1">
                            Institution
                          </span>
                          <span className="font-medium text-[#F3F4F6]">PLAI Budi Mulia Dua</span>
                        </div>
                        <div>
                          <span className="block text-[rgba(243,244,246,0.62)] mb-0.5 md:mb-1">
                            Location
                          </span>
                          <span className="font-medium text-[#F3F4F6]">
                            {PORTFOLIO_DATA.identity.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => onNavigateToSection('projects')}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2B86B] hover:underline cursor-pointer"
                        >
                          Jump to Featured Projects
                          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectActivePortal('bio')}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F3F4F6]/70 hover:text-[#E2B86B] cursor-pointer"
                        >
                          Switch to Who Is Fazle
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-6">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[rgba(243,244,246,0.62)]">
                          Core Stack (Select to Inspect)
                        </span>
                        {selectedTech && (
                          <button
                            type="button"
                            onClick={() => onSelectTech(null)}
                            className="text-xs font-medium text-[#E2B86B] hover:underline cursor-pointer"
                          >
                            Clear selection
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-2.5 mb-3 md:mb-4">
                        {PORTFOLIO_DATA.about.techStack.map((tech) => {
                          const isSelected = activeTechItem.name === tech.name;
                          return (
                            <button
                              key={tech.name}
                              type="button"
                              onClick={() => {
                                setActiveTechItem(tech);
                                onSelectTech(tech.name);
                              }}
                              className={`px-3 md:px-3.5 py-2 md:py-2.5 min-h-[36px] md:min-h-[42px] rounded-lg border text-left text-xs md:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B] ${
                                isSelected
                                  ? 'bg-[#0B0D10] border-[#E2B86B] text-[#E2B86B]'
                                  : 'bg-[#0B0D10]/75 border-[rgba(226,184,107,0.22)] text-[#F3F4F6]/85 hover:border-[#E2B86B] hover:text-[#E2B86B]'
                              }`}
                            >
                              {tech.name}
                            </button>
                          );
                        })}
                      </div>

                      <div
                        data-testid="tech-detail-panel"
                        className="rounded-xl bg-[#0B0D10] border border-[rgba(226,184,107,0.22)] p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#E2B86B] font-medium mb-0.5 md:mb-1">
                            <span>{activeTechItem.name}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[rgba(243,244,246,0.62)]">
                              {activeTechItem.category}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-[#F3F4F6]/80">
                            {activeTechItem.summary}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onFilterProjectsByTech(activeTechItem.name)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2B86B] hover:text-[#ecc983] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B]"
                        >
                          Filter Work
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Swipe Cue directly underneath Portal 01 */}
            {inMobileSwipeMode && (
              <button
                ref={mobileCueRef}
                type="button"
                data-testid="mobile-swipe-cue"
                onClick={() => scrollMobileRailTo('bio')}
                className="md:hidden mt-4 px-4 py-2 text-xs font-medium text-[#E2B86B] inline-flex items-center gap-1.5 cursor-pointer text-center"
              >
                <span>Geser ke kanan untuk melihat siapa sih Fazle</span>
                <span aria-hidden="true" className="inline-block swipe-cue-nudge">
                  &rarr;
                </span>
              </button>
            )}
          </div>

          {/* SLOT 02: WHO IS FAZLE? */}
          <div
            className={
              inMobileSwipeMode
                ? 'w-screen shrink-0 snap-center flex flex-col items-center justify-center px-4'
                : 'absolute inset-0 flex items-center justify-center pointer-events-none'
            }
          >
            <div
              id="mask-portal-bio"
              data-testid="portal-card-bio"
              ref={bioPortalRef}
              onMouseEnter={() => {
                if (!isMobileViewport && portalProgress < 0.08) onSelectActivePortal('bio');
              }}
              onClick={() => {
                if (portalProgress < 0.08) onSelectActivePortal('bio');
              }}
              className="relative bg-[#151821] border-[1.5px] border-[#E2B86B] overflow-hidden flex items-center justify-center pointer-events-auto cursor-pointer"
              style={{
                width: '380px',
                height: '470px',
                borderRadius: '220px 220px 28px 28px',
                zIndex: bioActive ? 20 : 10,
              }}
            >
              {/* Outer Preview Face (02) */}
              <div
                ref={bioPreviewRef}
                data-testid="portal-preview-bio"
                className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center select-none"
              >
                {renderReticleSvg('bio')}
                <span className="font-display text-2xl md:text-3xl font-semibold text-[#E2B86B] tabular-nums mb-2">
                  02
                </span>
                <p className="font-display text-base md:text-lg font-medium tracking-[0.12em] uppercase text-[#F3F4F6]">
                  02 — Who Is Fazle?
                </p>
                <p className="mt-2.5 text-xs text-[rgba(243,244,246,0.65)] max-w-[230px] leading-relaxed">
                  Zooms into Biodata, Personal Story &amp; Photo Gallery
                </p>
                <span
                  className={`mt-5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                    bioActive ? 'text-[#E2B86B]' : 'text-[#F3F4F6]/50'
                  }`}
                >
                  {bioActive ? 'Selected · Scroll to Zoom' : 'Hover or Click to Focus'}
                </span>
              </div>

              {/* Zoomed Interior: Who Is Fazle Spotlight inside Portal 02 */}
              <div
                ref={bioInnerRef}
                data-testid="bio-portal-content"
                aria-hidden={!(isZoomedInteractive && bioActive)}
                onClick={(e) => e.stopPropagation()}
                className="w-screen max-w-[100vw] shrink-0 z-20 flex items-center justify-center px-5 md:px-8 pt-[76px] pb-[76px] md:py-16 cursor-default"
                style={{
                  opacity: 0,
                  transform: 'scale(0.8276)',
                  pointerEvents: isZoomedInteractive && bioActive ? 'auto' : 'none',
                }}
              >
                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-center">
                  <div className="lg:col-span-7">
                    <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E2B86B] tabular-nums mb-2.5">
                      02 / Identity
                    </p>
                    <h2
                      className="font-display font-semibold text-[#F3F4F6] tracking-tight leading-tight mb-3"
                      style={{ fontSize: 'clamp(1.75rem, 3.8vw, 3rem)', textWrap: 'balance' }}
                    >
                      {PORTFOLIO_DATA.whoIsFazle.title}
                    </h2>
                    <p className="text-sm md:text-base text-[#E2B86B] font-medium mb-3">
                      {PORTFOLIO_DATA.whoIsFazle.headline}
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-[#F3F4F6]/85 leading-relaxed mb-5">
                      {PORTFOLIO_DATA.whoIsFazle.narrative}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5 pt-4 border-t border-[rgba(226,184,107,0.18)] text-xs md:text-sm">
                      {PORTFOLIO_DATA.whoIsFazle.biodata.map((entry) => (
                        <div key={entry.label}>
                          <span className="block text-[rgba(243,244,246,0.6)] mb-0.5">
                            {entry.label}
                          </span>
                          <span className="font-medium text-[#F3F4F6]">{entry.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onNavigateToSection('who-is-fazle')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E2B86B] text-[#0B0D10] text-xs font-semibold hover:bg-[#ecc983] transition-colors cursor-pointer"
                      >
                        Explore Photo Gallery &amp; Story
                        <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectActivePortal('workspace')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F3F4F6]/75 hover:text-[#E2B86B] cursor-pointer"
                      >
                        Switch to Workspace &amp; Stack
                      </button>
                    </div>
                  </div>

                  <div className="hidden lg:block lg:col-span-5">
                    <div className="rounded-2xl overflow-hidden border border-[rgba(226,184,107,0.3)] bg-[#0B0D10]">
                      <img
                        src={PORTFOLIO_DATA.whoIsFazle.gallery[0].src}
                        alt={PORTFOLIO_DATA.whoIsFazle.gallery[0].alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-[300px] object-cover"
                      />
                      <div className="px-4 py-3 flex items-center justify-between text-xs text-[rgba(243,244,246,0.72)] border-t border-[rgba(226,184,107,0.16)]">
                        <span>{PORTFOLIO_DATA.whoIsFazle.gallery[0].caption}</span>
                        <Sparkles className="w-3.5 h-3.5 text-[#E2B86B]" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {inMobileSwipeMode && (
              <button
                type="button"
                onClick={() => scrollMobileRailTo('workspace')}
                className="md:hidden mt-4 px-4 py-2 text-xs font-medium text-[#F3F4F6]/70 hover:text-[#E2B86B] cursor-pointer text-center"
              >
                &larr; Kembali ke Workspace Portal
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
