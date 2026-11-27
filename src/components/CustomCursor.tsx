import { useEffect, useRef, useState } from 'react';
import {
  clamp,
  computeSpringStep,
  resolveCursorMode,
  type CursorMode,
} from '../utils/portfolioEngine';

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    setEnabled(true);

    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;
    let disposed = false;

    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const interactive = el?.closest('[data-cursor], a, button, [role="button"]') as
        | HTMLElement
        | null;

      if (interactive) {
        const nextMode = resolveCursorMode(
          interactive.dataset.cursor,
          interactive.tagName,
          interactive.getAttribute('role')
        );
        setMode((prev) => (prev === nextMode ? prev : nextMode));

        if (nextMode === 'link') {
          const rect = interactive.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.5;
          const pullX = clamp((cx - e.clientX) * 0.14, -6, 6);
          const pullY = clamp((cy - e.clientY) * 0.14, -6, 6);
          targetX = e.clientX + pullX;
          targetY = e.clientY + pullY;
          return;
        }
      } else {
        setMode((prev) => (prev === 'default' ? prev : 'default'));
      }

      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const tick = () => {
      if (disposed) return;
      currentX = computeSpringStep(currentX, targetX, 0.22);
      currentY = computeSpringStep(currentY, targetY, 0.22);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  const pillLabel =
    mode === 'case' ? '[VIEW CASE]' : mode === 'link' ? '[OPEN LINK]' : null;

  return (
    <div
      ref={cursorRef}
      data-testid="custom-cursor"
      data-cursor-mode={mode}
      aria-hidden="true"
      className={`hidden md:block fixed top-0 left-0 z-[9998] pointer-events-none transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {pillLabel ? (
        <div className="-translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-[rgba(226,184,107,0.16)] backdrop-blur-md border border-[#E2B86B] text-[#E2B86B] font-mono text-[11px] font-medium tracking-[0.1em] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {pillLabel}
        </div>
      ) : (
        <div className="-translate-x-1/2 -translate-y-1/2 relative flex items-center justify-center">
          <span className="w-7 h-7 rounded-full border border-[#E2B86B]/45 transition-transform duration-200" />
          <span className="absolute w-2 h-2 rounded-full bg-[#E2B86B]" />
        </div>
      )}
    </div>
  );
}
