import { useEffect, useRef, useState } from 'react';
import { computePreloaderProgress } from '../utils/portfolioEngine';

interface PreloaderProps {
  onCurtainStart: () => void;
  onComplete: () => void;
}

const LOADER_DURATION_MS = 1350;

export function Preloader({ onCurtainStart, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [textFading, setTextFading] = useState(false);
  const [curtainLifted, setCurtainLifted] = useState(false);
  const grainRef = useRef<HTMLDivElement | null>(null);

  // Subtle film grain matching Deep Obsidian background
  useEffect(() => {
    const grainEl = grainRef.current;
    if (!grainEl) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = 128;
    offscreen.height = 128;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(128, 128);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    grainEl.style.backgroundImage = `url(${offscreen.toDataURL('image/png')})`;
    grainEl.style.backgroundRepeat = 'repeat';
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let fadeTimer = 0;
    let liftTimer = 0;
    let doneTimer = 0;
    let disposed = false;

    const triggerRevealSequence = () => {
      if (disposed) return;
      if (reducedMotion) {
        setTextFading(true);
        setCurtainLifted(true);
        onCurtainStart();
        doneTimer = window.setTimeout(() => {
          if (!disposed) onComplete();
        }, 160);
        return;
      }

      fadeTimer = window.setTimeout(() => {
        if (!disposed) setTextFading(true);
      }, 90);

      liftTimer = window.setTimeout(() => {
        if (!disposed) {
          setCurtainLifted(true);
          onCurtainStart();
        }
      }, 280);

      doneTimer = window.setTimeout(() => {
        if (!disposed) onComplete();
      }, 1050);
    };

    if (reducedMotion) {
      setProgress(100);
      triggerRevealSequence();
      return () => {
        disposed = true;
        window.clearTimeout(doneTimer);
      };
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      if (disposed) return;
      const elapsed = now - startTime;
      const next = computePreloaderProgress(elapsed, LOADER_DURATION_MS, false);
      setProgress(next);

      if (next < 100) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        triggerRevealSequence();
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(liftTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onComplete, onCurtainStart]);

  return (
    <div
      id="preloader"
      data-testid="preloader"
      role="status"
      aria-live="polite"
      aria-label={`Loading portfolio ${progress}%`}
      aria-hidden={curtainLifted}
      className={`preloader-curtain fixed inset-0 z-[9999] bg-[#0B0D10] flex flex-col items-center justify-center px-6 select-none overflow-hidden ${
        curtainLifted ? 'preloader-curtain--lifted pointer-events-none' : ''
      }`}
    >
      {/* Subtle radial glow behind reticle */}
      <div
        aria-hidden="true"
        className="absolute w-[420px] h-[420px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(226,184,107,0.12)_0%,rgba(226,184,107,0)_68%)]"
      />

      {/* Matching film grain overlay */}
      <div
        ref={grainRef}
        aria-hidden="true"
        className="ambient-grain absolute inset-0 pointer-events-none"
      />

      {/* Loader Stack */}
      <div
        className={`relative z-10 flex flex-col items-center transition-opacity duration-200 ${
          textFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Rotating Geometric Reticle Ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="preloader-reticle-outer absolute inset-0 w-full h-full text-[#E2B86B]"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.24"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeDasharray="64 276"
              strokeLinecap="round"
            />
            <line x1="60" y1="2" x2="60" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="60" y1="110" x2="60" y2="118" stroke="currentColor" strokeWidth="1.5" />
            <line x1="2" y1="60" x2="10" y2="60" stroke="currentColor" strokeWidth="1.5" />
            <line x1="110" y1="60" x2="118" y2="60" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          <svg
            viewBox="0 0 120 120"
            className="preloader-reticle-inner absolute inset-2.5 w-[calc(100%-20px)] h-[calc(100%-20px)] text-[#E2B86B]"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1"
              strokeDasharray="24 18 8 18"
            />
          </svg>

          <span
            aria-hidden="true"
            className="w-2 h-2 rotate-45 bg-[#E2B86B] shadow-[0_0_16px_rgba(226,184,107,0.8)]"
          />
        </div>

        {/* Display Wordmark */}
        <p className="font-display font-semibold text-2xl sm:text-3xl tracking-[0.34em] text-[#F3F4F6] uppercase mt-7 pl-[0.34em]">
          FAZLE
        </p>

        {/* Smooth 0% to 100% Counter */}
        <p
          data-testid="preloader-counter"
          className="font-display tabular-nums text-xs sm:text-sm font-medium tracking-[0.22em] text-[#E2B86B] mt-3"
        >
          {progress}%
        </p>

        {/* Thin 2px Champagne Gold Progress Bar */}
        <div
          aria-hidden="true"
          className="w-48 sm:w-56 h-[2px] bg-[rgba(226,184,107,0.18)] mt-4 overflow-hidden"
        >
          <div
            className="h-full bg-[#E2B86B] transition-[width] duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
