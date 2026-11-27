import { useEffect, useRef } from 'react';
import { clamp, computeParticleSpeed, computeSpringStep } from '../utils/portfolioEngine';
import type { PortfolioTheme } from '../utils/theme';

interface AmbientBackgroundProps {
  portalVelocityRef: React.RefObject<number>;
  theme: PortfolioTheme;
  themeGateOpen: boolean;
  hoveredTheme: PortfolioTheme | null;
  motionPaused: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  size: number;
  baseSpeed: number;
  alpha: number;
  driftX: number;
}

function drawParticleSprite(sprite: HTMLCanvasElement, theme: PortfolioTheme) {
  const context = sprite.getContext('2d');
  if (!context) return;

  context.clearRect(0, 0, sprite.width, sprite.height);
  const color = theme === 'dark' ? '226, 184, 107' : '217, 78, 40';
  const gradient = context.createRadialGradient(6, 6, 0.5, 6, 6, 6);
  gradient.addColorStop(0, `rgba(${color}, 1)`);
  gradient.addColorStop(0.55, `rgba(${color}, 0.65)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, sprite.width, sprite.height);
}

function measureTrackPeriod(track: HTMLDivElement | null): number {
  const firstCopy = track?.firstElementChild;
  if (!track || !firstCopy) return 0;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  return firstCopy.getBoundingClientRect().width + gap;
}

export function AmbientBackground({
  portalVelocityRef,
  theme,
  themeGateOpen,
  hoveredTheme,
  motionPaused,
}: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const grainRef = useRef<HTMLDivElement | null>(null);
  const securityLineRef = useRef<HTMLDivElement | null>(null);
  const developerLineRef = useRef<HTMLDivElement | null>(null);
  const particleSpriteRef = useRef<HTMLCanvasElement | null>(null);
  const kineticVelocityRef = useRef(0.4);
  const kineticPositionRef = useRef(0);
  const securityPeriodRef = useRef(0);
  const developerPeriodRef = useRef(0);
  const motionConfigRef = useRef({ themeGateOpen, hoveredTheme, motionPaused });
  motionConfigRef.current = { themeGateOpen, hoveredTheme, motionPaused };
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Layer 5: Pre-bake a lightweight 128x128 film grain tile once (zero runtime filter cost)
  useEffect(() => {
    const grainEl = grainRef.current;
    if (!grainEl) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = 128;
    offscreen.height = 128;
    const octx = offscreen.getContext('2d');
    if (!octx) return;
    const img = octx.createImageData(128, 128);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
    grainEl.style.backgroundImage = `url(${offscreen.toDataURL('image/png')})`;
    grainEl.style.backgroundRepeat = 'repeat';
  }, []);

  // Layer 3: Compositor-only pointer spotlight
  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight || motionPaused) return;

    const setPos = (x: number, y: number) => {
      spotlight.style.transform = `translate3d(${(x - 450).toFixed(1)}px, ${(y - 450).toFixed(1)}px, 0)`;
    };

    setPos(window.innerWidth * 0.55, window.innerHeight * 0.42);

    const handlePointerMove = (e: PointerEvent) => {
      setPos(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [motionPaused]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastFrameTime = 0;
    const measurePeriods = () => {
      securityPeriodRef.current = measureTrackPeriod(securityLineRef.current);
      developerPeriodRef.current = measureTrackPeriod(developerLineRef.current);
    };

    const updateLinePositions = () => {
      const { themeGateOpen: gateOpen } = motionConfigRef.current;
      const hero = gateOpen ? null : document.getElementById('home');
      const scrollOffset = hero
        ? clamp(-hero.getBoundingClientRect().top, 0, hero.offsetHeight) * 0.16
        : 0;
      const x = kineticPositionRef.current;

      if (securityLineRef.current) {
        securityLineRef.current.style.transform = `translate3d(${x - scrollOffset}px, 0, 0)`;
      }
      if (developerLineRef.current) {
        developerLineRef.current.style.transform = `translate3d(${x + scrollOffset}px, 0, 0)`;
      }
    };

    if (reducedMotion || motionPaused) {
      kineticVelocityRef.current = 0;
      measurePeriods();
      updateLinePositions();
      return;
    }

    const animateLines = (time: number) => {
      const config = motionConfigRef.current;
      const velocity = kineticVelocityRef.current;
      const idleDirection = velocity < 0 ? -1 : 1;
      const targetVelocity = config.themeGateOpen
        ? config.hoveredTheme === 'dark'
          ? -7.5
          : config.hoveredTheme === 'light'
            ? 7.5
            : idleDirection * 0.4
        : 0;

      const nextVelocity = computeSpringStep(velocity, targetVelocity, 0.08);
      kineticVelocityRef.current = nextVelocity;
      const frameScale = lastFrameTime
        ? clamp((time - lastFrameTime) / 16.67, 0.5, 2)
        : 1;
      const period = Math.max(
        securityPeriodRef.current,
        developerPeriodRef.current,
        window.innerWidth
      );
      let nextPosition = kineticPositionRef.current + nextVelocity * frameScale;
      if (nextPosition < -period) nextPosition += period;
      if (nextPosition > period) nextPosition -= period;
      kineticPositionRef.current = nextPosition;
      lastFrameTime = time;
      updateLinePositions();

      if (config.themeGateOpen || Math.abs(nextVelocity - targetVelocity) > 0.01) {
        rafId = window.requestAnimationFrame(animateLines);
      } else {
        rafId = 0;
      }
    };

    const updateOnScroll = () => {
      if (!rafId) updateLinePositions();
    };

    measurePeriods();
    const resizeObserver = new ResizeObserver(measurePeriods);
    if (securityLineRef.current) resizeObserver.observe(securityLineRef.current);
    if (developerLineRef.current) resizeObserver.observe(developerLineRef.current);
    window.addEventListener('scroll', updateOnScroll, { passive: true });

    if (!motionPaused && (themeGateOpen || Math.abs(kineticVelocityRef.current) > 0.01)) {
      rafId = window.requestAnimationFrame(animateLines);
    } else {
      updateLinePositions();
    }

    return () => {
      window.removeEventListener('scroll', updateOnScroll);
      resizeObserver.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, [themeGateOpen, motionPaused]);

  // Layer 4: 45 lightweight 3D dust particles using pre-rendered sprite & 0.5x backing buffer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scale = 0.5;
    let width = Math.max(320, Math.round(window.innerWidth * scale));
    let height = Math.max(240, Math.round(window.innerHeight * scale));
    canvas.width = width;
    canvas.height = height;

    // Pre-render one golden particle sprite
    const sprite = document.createElement('canvas');
    sprite.width = 12;
    sprite.height = 12;
    particleSpriteRef.current = sprite;
    drawParticleSprite(sprite, themeRef.current);

    const particles: Particle[] = Array.from({ length: 45 }, () => {
      const z = 0.25 + Math.random() * 0.75;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        size: 1.8 + z * 2.4,
        baseSpeed: 0.14 + z * 0.28,
        alpha: 0.22 + z * 0.48,
        driftX: (Math.random() - 0.5) * 0.14,
      };
    });

    const drawParticles = (advance: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const kineticBoost = clamp((Math.abs(kineticVelocityRef.current) - 0.4) / 7.1, 0, 1);
      const portalVelocity = portalVelocityRef.current ?? 0;
      for (const p of particles) {
        if (advance && !motionConfigRef.current.motionPaused) {
          const speed = computeParticleSpeed(
            p.baseSpeed,
            Math.max(portalVelocity, kineticBoost)
          );
          p.y -= speed;
          p.x += p.driftX + Math.sign(kineticVelocityRef.current) * speed * 0.35;

          if (portalVelocity > 0.05) {
            const centerX = width * 0.5;
            p.x += (centerX - p.x) * 0.0025 * portalVelocity;
          }

          if (p.y < -6) {
            p.y = height + 6;
            p.x = Math.random() * width;
          }
          if (p.x < -6) p.x = width + 6;
          if (p.x > width + 6) p.x = -6;
        }

        ctx.globalAlpha = p.alpha;
        ctx.drawImage(sprite, p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotion) {
      drawParticles(false);
      const handleResize = () => {
        width = Math.max(320, Math.round(window.innerWidth * scale));
        height = Math.max(240, Math.round(window.innerHeight * scale));
        canvas.width = width;
        canvas.height = height;
        drawParticles(false);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    let rafId = 0;
    let timerId = 0;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      drawParticles(true);
      timerId = window.setTimeout(() => {
        if (!disposed) {
          rafId = window.requestAnimationFrame(render);
        }
      }, 50);
    };

    const handleResize = () => {
      width = Math.max(320, Math.round(window.innerWidth * scale));
      height = Math.max(240, Math.round(window.innerHeight * scale));
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    rafId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      window.clearTimeout(timerId);
      window.cancelAnimationFrame(rafId);
    };
  }, [portalVelocityRef]);

  useEffect(() => {
    const sprite = particleSpriteRef.current;
    if (sprite) drawParticleSprite(sprite, theme);
  }, [theme]);

  return (
    <div
      id="ambient-bg"
      aria-hidden="true"
      data-motion-paused={motionPaused}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Layer 1: Architectural 1px Vertical Structural Hairline Grid */}
      <div
        data-testid="architectural-grid"
        className="absolute inset-0 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4"
      >
        <div className="h-full border-l border-[rgba(243,244,246,0.1)]" />
        <div className="h-full border-l border-[rgba(243,244,246,0.1)] border-r md:border-r-0" />
        <div className="hidden md:block h-full border-l border-[rgba(243,244,246,0.1)]" />
        <div className="hidden md:block h-full border-l border-r border-[rgba(243,244,246,0.1)]" />
      </div>

      {/* Layer 2: Floating Ambient Orbs */}
      <div className="ambient-orb-gold absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full" />
      <div className="ambient-orb-slate absolute -bottom-40 -right-24 w-[620px] h-[620px] rounded-full" />

      {/* Layer 3: Interactive Cursor Spotlight */}
      <div
        ref={spotlightRef}
        className="ambient-spotlight-orb absolute top-0 left-0 pointer-events-none"
      />

      {/* Layer 4: 3D Particle Dust Canvas */}
      <canvas
        id="particle-canvas"
        data-testid="particle-canvas"
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div
        aria-hidden="true"
        className="ambient-kinetic-type absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div
          ref={securityLineRef}
          className="ambient-kinetic-line ambient-kinetic-line--security"
        >
          <span>CYBERSECURITY</span>
          <span aria-hidden="true">CYBERSECURITY</span>
        </div>
        <div
          ref={developerLineRef}
          className="ambient-kinetic-line ambient-kinetic-line--developer"
        >
          <span>FULL-STACK DEVELOPER</span>
          <span aria-hidden="true">FULL-STACK DEVELOPER</span>
        </div>
      </div>

      {/* Layer 5: Subtle Film Grain Overlay (0.03 opacity) */}
      <div ref={grainRef} className="ambient-grain absolute inset-0" />
    </div>
  );
}
