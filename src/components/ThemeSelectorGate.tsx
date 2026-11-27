import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Pause, Play } from 'lucide-react';
import type { PortfolioTheme } from '../utils/theme';

interface ThemeSelectorGateProps {
  onPreview: (theme: PortfolioTheme) => void;
  onHover: (theme: PortfolioTheme | null) => void;
  onChoose: (theme: PortfolioTheme) => void;
  onComplete: () => void;
  motionPaused: boolean;
  onMotionPausedChange: (paused: boolean) => void;
}

const THEME_OPTIONS: Array<{
  id: PortfolioTheme;
  name: string;
  description: string;
  background: string;
  surface: string;
  accent: string;
  foreground: string;
}> = [
  {
    id: 'dark',
    name: 'Obsidian Noir',
    description: 'Deep contrast. Champagne details. Built for after hours.',
    background: '#0B0D10',
    surface: '#151821',
    accent: '#E2B86B',
    foreground: '#F3F4F6',
  },
  {
    id: 'light',
    name: 'Editorial Daylight',
    description: 'Warm paper. Vermilion accents. A brighter point of view.',
    background: '#F4F1EA',
    surface: '#FFFFFF',
    accent: '#D94E28',
    foreground: '#111318',
  },
];

export function ThemeSelectorGate({
  onPreview,
  onHover,
  onChoose,
  onComplete,
  motionPaused,
  onMotionPausedChange,
}: ThemeSelectorGateProps) {
  const [leaving, setLeaving] = useState(false);
  const [chosenTheme, setChosenTheme] = useState<PortfolioTheme | null>(null);
  const firstOptionRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    firstOptionRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!chosenTheme) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(onComplete, prefersReducedMotion ? 0 : 760);
    return () => window.clearTimeout(timer);
  }, [chosenTheme, onComplete]);

  const chooseTheme = (theme: PortfolioTheme) => {
    if (chosenTheme) return;
    setChosenTheme(theme);
    setLeaving(true);
    onHover(null);
    onPreview(theme);
    onChoose(theme);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-gate-title"
      data-testid="theme-gate"
      className={`theme-gate fixed inset-0 z-[9998] overflow-y-auto ${
        leaving ? 'theme-gate--leaving' : ''
      }`}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const options = event.currentTarget.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)'
        );
        const first = options[0];
        const last = options[options.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      onMouseLeave={() => {
        if (!chosenTheme) {
          onHover(null);
          onPreview('dark');
        }
      }}
    >
      <div className="theme-gate__content min-h-[100dvh] flex flex-col justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-10">
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase opacity-65">
              Fazle Ferino · Portfolio
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tabular-nums opacity-65">01 / 02</span>
              <button
                type="button"
                aria-label={motionPaused ? 'Resume background motion' : 'Pause background motion'}
                aria-pressed={motionPaused}
                onClick={() => onMotionPausedChange(!motionPaused)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border-subtle)] px-3 text-xs hover:border-[var(--accent-highlight)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-highlight)]"
              >
                {motionPaused ? (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {motionPaused ? 'Resume motion' : 'Pause motion'}
                </span>
              </button>
            </div>
          </div>

          <p className="font-mono text-xs tracking-[0.16em] uppercase text-[var(--accent-highlight)] mb-3">
            Choose your atmosphere
          </p>
          <h1
            id="theme-gate-title"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[0.98] mb-4"
          >
            Same signal.
            <br />
            <span className="opacity-55">Different light.</span>
          </h1>
          <p className="text-sm sm:text-base opacity-70 max-w-xl mb-9">
            Pick a palette to enter. You can switch themes any time from the navigation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEME_OPTIONS.map((option, index) => {
              const isSelected = chosenTheme === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  ref={index === 0 ? firstOptionRef : undefined}
                  data-testid={`theme-option-${option.id}`}
                  onMouseEnter={() => onPreview(option.id)}
                  onPointerEnter={() => {
                    onHover(option.id);
                    onPreview(option.id);
                  }}
                  onPointerLeave={() => onHover(null)}
                  onFocus={() => onPreview(option.id)}
                  onBlur={() => {
                    if (!chosenTheme) onPreview('dark');
                  }}
                  onMouseLeave={() => {
                    if (!chosenTheme) onPreview('dark');
                  }}
                  onClick={() => chooseTheme(option.id)}
                  disabled={Boolean(chosenTheme)}
                  className="theme-option group text-left rounded-2xl p-4 sm:p-5 border transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-highlight)] disabled:cursor-default"
                  style={{
                    backgroundColor: option.surface,
                    color: option.foreground,
                    borderColor: `${option.accent}55`,
                    transitionDelay: `${index * 70}ms`,
                  }}
                >
                  <div
                    className="relative aspect-[16/8] rounded-xl overflow-hidden p-4 sm:p-5 flex flex-col justify-between border"
                    style={{
                      backgroundColor: option.background,
                      borderColor: `${option.accent}35`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-[0.14em] uppercase opacity-60">
                        {option.id === 'dark' ? '01 / Night mode' : '02 / Day mode'}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: option.accent }}
                      />
                    </div>
                    <div>
                      <span
                        className="block font-display text-2xl sm:text-3xl font-semibold tracking-tight"
                        style={{ color: option.accent }}
                      >
                        FAZLE
                      </span>
                      <span className="block font-mono text-[9px] tracking-[0.12em] uppercase opacity-55">
                        Cybersecurity · Full-stack
                      </span>
                    </div>
                    <div
                      className="absolute right-5 bottom-5 w-12 h-12 rounded-full border flex items-center justify-center"
                      style={{ borderColor: `${option.accent}70`, color: option.accent }}
                    >
                      <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div>
                      <h2 className="font-display text-lg font-semibold mb-1">{option.name}</h2>
                      <p className="text-xs leading-relaxed opacity-65">{option.description}</p>
                    </div>
                    <span
                      className="shrink-0 w-8 h-8 rounded-full border flex items-center justify-center"
                      style={{ borderColor: `${option.accent}65`, color: option.accent }}
                    >
                      {isSelected ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: option.accent }} />
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-45 mt-6">
            Select a theme to continue
          </p>
        </div>
      </div>
    </div>
  );
}
