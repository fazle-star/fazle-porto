import { ThemeSwitcher } from './ThemeSwitcher';
import type { PortfolioTheme } from '../utils/theme';

interface MobileFloatingNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  theme: PortfolioTheme;
  onThemeChange: (theme: PortfolioTheme) => void;
}

const MOBILE_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'who-is-fazle', label: 'Bio' },
  { id: 'projects', label: 'Work' },
  { id: 'cybersecurity', label: 'Cyber' },
  { id: 'contact', label: 'Contact' },
];

export function MobileFloatingNav({
  activeSection,
  onNavigate,
  theme,
  onThemeChange,
}: MobileFloatingNavProps) {
  return (
    <nav
      aria-label="Mobile section navigation"
      data-testid="mobile-floating-nav"
      className="md:hidden fixed bottom-[16px] left-1/2 -translate-x-1/2 z-[120] flex items-center gap-0.5 rounded-full border border-[rgba(226,184,107,0.22)] px-1.5 py-1 shadow-[0_12px_36px_rgba(0,0,0,0.65)] bg-[#151821]/96"
    >
      {MOBILE_LINKS.map((link) => {
        const isActive = activeSection === link.id;
        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.id);
            }}
            className={`px-3 py-1.5 min-h-[38px] flex items-center justify-center rounded-full text-xs whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B] ${
              isActive
                ? 'bg-[#E2B86B] text-[#0B0D10] font-bold'
                : 'text-[#F3F4F6]/80 font-medium hover:text-[#F3F4F6]'
            }`}
          >
            {link.label}
          </a>
        );
      })}
      <ThemeSwitcher theme={theme} onChange={onThemeChange} compact />
    </nav>
  );
}
