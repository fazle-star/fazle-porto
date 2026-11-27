import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { ThemeSelectorGate } from './components/ThemeSelectorGate';
import { TopHeader } from './components/TopHeader';
import type { PortfolioTheme } from './utils/theme';
import { HeroSection } from './components/HeroSection';
import { PortalAboutSection } from './components/PortalAboutSection';
import { WhoIsFazleSection } from './components/WhoIsFazleSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CybersecuritySection } from './components/CybersecuritySection';
import { ContactFooterSection } from './components/ContactFooterSection';
import { MobileFloatingNav } from './components/MobileFloatingNav';
import type { PortalId } from './utils/portfolioEngine';

const OBSERVED_SECTION_IDS = [
  'home',
  'about',
  'who-is-fazle',
  'projects',
  'cybersecurity',
  'contact',
];

export default function App() {
  const portalVelocityRef = useRef<number>(0);
  const [preloaderDone, setPreloaderDone] = useState<boolean>(false);
  const [themeGateVisible, setThemeGateVisible] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState<boolean>(false);
  const [themePreview, setThemePreview] = useState<PortfolioTheme>('dark');
  const [hoveredTheme, setHoveredTheme] = useState<PortfolioTheme | null>(null);
  const [kineticMotionPaused, setKineticMotionPaused] = useState(false);
  const [themeGateComplete, setThemeGateComplete] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activePortal, setActivePortal] = useState<PortalId>('workspace');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [projectTechFilter, setProjectTechFilter] = useState<string | null>(null);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  const handleCurtainStart = useCallback(() => {
    setThemeGateVisible(true);
  }, []);

  const handleThemeChange = useCallback((nextTheme: PortfolioTheme) => {
    setThemePreview(nextTheme);
  }, []);

  const handleThemeChosen = useCallback((nextTheme: PortfolioTheme) => {
    setHoveredTheme(null);
    setKineticMotionPaused(false);
    setThemePreview(nextTheme);
    setHeroRevealed(true);
  }, []);

  const handleThemeGateComplete = useCallback(() => {
    setThemeGateComplete(true);
  }, []);

  useLayoutEffect(() => {
    if (themeGateComplete) return;
    window.scrollTo(0, 0);
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousOverflow = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousOverflow;
    };
  }, [themeGateComplete]);

  const scrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'about') {
      setActivePortal('workspace');
    }
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionId);
  }, []);

  const handleFilterProjectsByTech = useCallback(
    (tech: string) => {
      setProjectTechFilter(tech);
      scrollToSection('projects');
    },
    [scrollToSection]
  );
  const themeGateOpen = themeGateVisible && !heroRevealed;

  // Scroll Spy via IntersectionObserver for Desktop Header & Mobile Floating Nav
  useEffect(() => {
    if (!heroRevealed) return;
    const elements = OBSERVED_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: 0,
      }
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [heroRevealed]);

  return (
    <div
      data-theme={themePreview}
      data-theme-gate-open={themeGateOpen ? 'true' : 'false'}
      className="relative min-h-screen bg-[#0B0D10] text-[#F3F4F6] transition-colors duration-500"
      style={{ colorScheme: themePreview }}
    >
      {heroRevealed && <CustomCursor />}

      {!preloaderDone && (
        <Preloader
          onCurtainStart={handleCurtainStart}
          onComplete={handlePreloaderComplete}
        />
      )}

      {themeGateVisible && !themeGateComplete && (
        <ThemeSelectorGate
          onPreview={setThemePreview}
          onHover={setHoveredTheme}
          onChoose={handleThemeChosen}
          onComplete={handleThemeGateComplete}
          motionPaused={kineticMotionPaused}
          onMotionPausedChange={setKineticMotionPaused}
        />
      )}

      {/* Fixed 5-Layer Dynamic Ambient Background */}
      <AmbientBackground
        portalVelocityRef={portalVelocityRef}
        theme={themePreview}
        themeGateOpen={themeGateOpen}
        hoveredTheme={hoveredTheme}
        motionPaused={kineticMotionPaused}
      />

      {heroRevealed && (
        <TopHeader
          activeSection={activeSection}
          onNavigate={scrollToSection}
          theme={themePreview}
          onThemeChange={handleThemeChange}
        />
      )}

      <main
        aria-hidden={!heroRevealed}
        inert={!heroRevealed}
        className={`relative z-10 ${heroRevealed ? '' : 'invisible'}`}
      >
        {/* Section 1: Hero Landing */}
        <HeroSection
          heroVisible={heroRevealed}
          onExploreWork={() => scrollToSection('projects')}
          onSecuritySection={() => scrollToSection('cybersecurity')}
          onEnterPortal={() => scrollToSection('portal-track')}
        />

        {heroRevealed && (
          <>
            {/* Section 2: Dual 3D Mask Zoom Portals -> Workspace / Bio Spotlight */}
            <PortalAboutSection
              portalVelocityRef={portalVelocityRef}
              activePortal={activePortal}
              onSelectActivePortal={setActivePortal}
              selectedTech={selectedTech}
              onSelectTech={setSelectedTech}
              onFilterProjectsByTech={handleFilterProjectsByTech}
              onNavigateToSection={scrollToSection}
            />

            {/* Section 3: Who Is Fazle? Biodata, Auto-Scrolling Photo Gallery & 3 Pillars */}
            <WhoIsFazleSection />

            {/* Section 4: Scroll-Stacking Project Preview Cards */}
            <ProjectsSection
              activeTechFilter={projectTechFilter}
              onChangeTechFilter={setProjectTechFilter}
              theme={themePreview}
            />

            {/* Section 5: Cybersecurity & CTF */}
            <CybersecuritySection />

            {/* Section 6: Contact & Footer */}
            <ContactFooterSection onNavigate={scrollToSection} />
          </>
        )}
      </main>

      {heroRevealed && (
        <MobileFloatingNav
          activeSection={activeSection}
          onNavigate={scrollToSection}
          theme={themePreview}
          onThemeChange={handleThemeChange}
        />
      )}
    </div>
  );
}

