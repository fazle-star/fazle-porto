import { useEffect, useState } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { formatYogyakartaTime, getBrandDisplayName } from '../utils/portfolioEngine';

interface TopHeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const DESKTOP_NAV_ITEMS = [
  { id: 'about', index: '01', label: 'About' },
  { id: 'who-is-fazle', index: '02', label: 'Bio' },
  { id: 'projects', index: '03', label: 'Work' },
  { id: 'cybersecurity', index: '04', label: 'Security' },
  { id: 'contact', index: '05', label: 'Contact' },
];

export function TopHeader({ activeSection, onNavigate }: TopHeaderProps) {
  const [brandName, setBrandName] = useState<string>(() =>
    typeof window !== 'undefined'
      ? getBrandDisplayName(window.innerWidth)
      : PORTFOLIO_DATA.identity.fullName
  );
  const [wibTime, setWibTime] = useState<string>(() => formatYogyakartaTime(new Date()));

  useEffect(() => {
    const updateBrand = () => {
      setBrandName(getBrandDisplayName(window.innerWidth));
    };
    updateBrand();
    window.addEventListener('resize', updateBrand);
    return () => window.removeEventListener('resize', updateBrand);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setWibTime(formatYogyakartaTime(new Date()));
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-[100] border-b border-[rgba(243,244,246,0.12)] bg-[#0B0D10]"
      style={{ height: '68px' }}
    >
      <div className="max-w-7xl mx-auto h-full px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Identity (Responsive Full Name Desktop / Short Name Mobile) */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          data-testid="header-brand"
          className="font-display font-semibold text-base md:text-lg tracking-tight text-[#F3F4F6] hover:text-[#E2B86B] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B]"
        >
          {brandName}
        </a>

        {/* Zone 2: Crisp Swiss Index Nav Links (Desktop) */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 lg:gap-7">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className={`inline-flex items-baseline gap-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors border-b pb-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B] ${
                  isActive
                    ? 'text-[#E2B86B] border-[#E2B86B]'
                    : 'text-[#F3F4F6]/75 border-transparent hover:text-[#F3F4F6]'
                }`}
              >
                <span className="font-mono text-[11px] text-[#E2B86B]/75 tabular-nums">
                  {item.index}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Live Real-Time Yogyakarta (WIB) Telemetry Clock */}
        <div
          data-testid="wib-clock"
          aria-label={`Yogyakarta local time ${wibTime} WIB`}
          className="font-mono text-xs tabular-nums whitespace-nowrap shrink-0 flex items-center gap-2 text-[#F3F4F6]/80"
        >
          <span className="hidden sm:inline text-[11px] tracking-[0.12em] uppercase text-[rgba(243,244,246,0.56)]">
            Yogyakarta
          </span>
          <span className="hidden sm:inline text-[rgba(243,244,246,0.3)]" aria-hidden="true">
            ·
          </span>
          <span className="text-[#E2B86B] font-medium">{wibTime} WIB</span>
        </div>
      </div>
    </header>
  );
}
