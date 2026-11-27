import { useEffect, useRef } from 'react';
import { computeParticleSpeed } from '../utils/portfolioEngine';

interface AmbientBackgroundProps {
  portalVelocityRef: React.RefObject<number>;
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

export function AmbientBackground({ portalVelocityRef }: AmbientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const grainRef = useRef<HTMLDivElement | null>(null);

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
    if (!spotlight) return;

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
  }, []);

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
    const sctx = sprite.getContext('2d');
    if (sctx) {
      const grad = sctx.createRadialGradient(6, 6, 0.5, 6, 6, 6);
      grad.addColorStop(0, 'rgba(226, 184, 107, 1)');
      grad.addColorStop(0.55, 'rgba(226, 184, 107, 0.65)');
      grad.addColorStop(1, 'rgba(226, 184, 107, 0)');
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 12, 12);
    }

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

    const drawParticles = (velocity: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (velocity >= 0) {
          const speed = computeParticleSpeed(p.baseSpeed, velocity);
          p.y -= speed;
          p.x += p.driftX;

          if (velocity > 0.05) {
            const centerX = width * 0.5;
            p.x += (centerX - p.x) * 0.0025 * velocity;
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
      drawParticles(-1);
      const handleResize = () => {
        width = Math.max(320, Math.round(window.innerWidth * scale));
        height = Math.max(240, Math.round(window.innerHeight * scale));
        canvas.width = width;
        canvas.height = height;
        drawParticles(-1);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    let rafId = 0;
    let timerId = 0;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      drawParticles(portalVelocityRef.current ?? 0);
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

  return (
    <div
      id="ambient-bg"
      aria-hidden="true"
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

      {/* Layer 5: Subtle Film Grain Overlay (0.03 opacity) */}
      <div ref={grainRef} className="ambient-grain absolute inset-0" />
    </div>
  );
}
