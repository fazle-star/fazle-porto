import { useCallback, useEffect, useRef, useState } from 'react';
import { AmbientBackground } from './components/AmbientBackground';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { TopHeader } from './components/TopHeader';
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
  const [heroRevealed, setHeroRevealed] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [activePortal, setActivePortal] = useState<PortalId>('workspace');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [projectTechFilter, setProjectTechFilter] = useState<string | null>(null);

  const handleCurtainStart = useCallback(() => {
    setHeroRevealed(true);
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

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

  // Scroll Spy via IntersectionObserver for Desktop Header & Mobile Floating Nav
  useEffect(() => {
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
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#F3F4F6]">
      <CustomCursor />

      {!preloaderDone && (
        <Preloader
          onCurtainStart={handleCurtainStart}
          onComplete={handlePreloaderComplete}
        />
      )}

      {/* Fixed 5-Layer Dynamic Ambient Background */}
      <AmbientBackground portalVelocityRef={portalVelocityRef} />

      {/* Fixed Top Header Bar */}
      <TopHeader activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Main Content Flow */}
      <main className="relative z-10">
        {/* Section 1: Hero Landing */}
        <HeroSection
          heroVisible={heroRevealed}
          onExploreWork={() => scrollToSection('projects')}
          onSecuritySection={() => scrollToSection('cybersecurity')}
          onEnterPortal={() => scrollToSection('portal-track')}
        />

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

        {/* Section 4: Featured Projects with 3D Flip Cards & PNG Preview */}
        <ProjectsSection
          activeTechFilter={projectTechFilter}
          onChangeTechFilter={setProjectTechFilter}
        />

        {/* Section 5: Cybersecurity & CTF */}
        <CybersecuritySection />

        {/* Section 6: Contact & Footer */}
        <ContactFooterSection onNavigate={scrollToSection} />
      </main>

      {/* Mobile Floating Navigation Bar (< 768px) */}
      <MobileFloatingNav activeSection={activeSection} onNavigate={scrollToSection} />
    </div>
  );
}

