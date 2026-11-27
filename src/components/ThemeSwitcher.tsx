import { Moon, Sun } from 'lucide-react';
import type { PortfolioTheme } from '../utils/theme';

interface ThemeSwitcherProps {
  theme: PortfolioTheme;
  onChange: (theme: PortfolioTheme) => void;
  compact?: boolean;
}

export function ThemeSwitcher({ theme, onChange, compact = false }: ThemeSwitcherProps) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const nextThemeName = nextTheme === 'light' ? 'Editorial Daylight' : 'Obsidian Noir';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextThemeName} theme`}
      title={`Switch to ${nextThemeName}`}
      data-testid="theme-switcher"
      onClick={() => onChange(nextTheme)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-[rgba(226,184,107,0.35)] bg-[#151821] text-[#F3F4F6] hover:border-[#E2B86B] hover:text-[#E2B86B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B] ${
        compact ? 'min-w-9 min-h-9 px-2' : 'min-h-9 px-3 text-[11px] font-medium'
      }`}
    >
      <ThemeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {!compact && <span>{theme === 'dark' ? 'DAYLIGHT' : 'NOIR'}</span>}
    </button>
  );
}
