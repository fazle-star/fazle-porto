import type { ProjectItem } from '../data/portfolio';

export type PortalId = 'workspace' | 'bio';

export interface PortalTransformState {
  progress: number;
  scale: number;
  borderRadiusTop: number;
  borderRadiusBottom: number;
  previewOpacity: number;
  previewScale: number;
  innerOpacity: number;
  innerTranslateZ: number;
  velocityBoost: number;
}

export interface DualPortalSlotMetrics {
  width: number;
  height: number;
  offsetX: number;
  scale: number;
  opacity: number;
  borderRadiusTop: number;
  borderRadiusBottom: number;
  borderAlpha: number;
  previewOpacity: number;
  previewScale: number;
  innerOpacity: number;
  innerScale: number;
  isReceding: boolean;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Computes normalized 0..1 progress across #portal-track.
 * Progress is 0 when track top reaches viewport top, and 1 when track bottom reaches viewport bottom.
 */
export function computePortalProgress(
  trackTop: number,
  trackHeight: number,
  viewportHeight: number
): number {
  const scrollableDistance = Math.max(1, trackHeight - viewportHeight);
  const scrolled = -trackTop;
  return clamp(scrolled / scrollableDistance, 0, 1);
}

/**
 * Computes CSS transform & opacity values for the 3D mask zoom portal.
 * - Scale curve: 1 -> 15 via (1 + progress^2.2 * 14)
 * - Border radius morphs from arch (220px top / 28px bottom) down to 0px as progress approaches 0.85
 * - Preview fades out 0.0 -> 0.35
 * - Inner content emerges from translateZ(-250px) -> 0px and fades in 0.45 -> 0.88
 */
export function computePortalTransform(
  progress: number,
  reducedMotion = false
): PortalTransformState {
  const p = clamp(progress, 0, 1);

  if (reducedMotion) {
    return {
      progress: p,
      scale: p >= 0.5 ? 15 : 1,
      borderRadiusTop: p >= 0.5 ? 0 : 220,
      borderRadiusBottom: p >= 0.5 ? 0 : 28,
      previewOpacity: p >= 0.5 ? 0 : 1,
      previewScale: 1,
      innerOpacity: p >= 0.5 ? 1 : 0,
      innerTranslateZ: 0,
      velocityBoost: 0,
    };
  }

  const scale = 1 + Math.pow(p, 2.2) * 14;

  const radiusT = clamp(p / 0.85, 0, 1);
  const easedRadiusT = 1 - Math.pow(1 - radiusT, 2);
  const borderRadiusTop = Math.round(220 * (1 - easedRadiusT));
  const borderRadiusBottom = Math.round(28 * (1 - easedRadiusT));

  const previewT = clamp(p / 0.35, 0, 1);
  const previewOpacity = Number((1 - previewT).toFixed(3));
  const previewScale = Number((1 + previewT * 0.45).toFixed(3));

  const innerT = clamp((p - 0.45) / (0.88 - 0.45), 0, 1);
  const easedInnerT = 1 - Math.pow(1 - innerT, 3);
  const innerOpacity = Number(easedInnerT.toFixed(3));
  const innerTranslateZ = Number((-250 * (1 - easedInnerT)).toFixed(2));

  const velocityBoost = p > 0.05 && p < 0.9 ? Math.sin(p * Math.PI) : 0;

  return {
    progress: p,
    scale: Number(scale.toFixed(4)),
    borderRadiusTop,
    borderRadiusBottom,
    previewOpacity,
    previewScale,
    innerOpacity,
    innerTranslateZ,
    velocityBoost: Number(velocityBoost.toFixed(3)),
  };
}

export interface PortalBoxDimensions {
  width: number;
  height: number;
}

/**
 * Computes exact pixel dimensions for the arch mask portal expanding from
 * centered arch (300x420 mobile / 440x540 desktop) to full viewport bounds.
 */
export function computePortalBoxDimensions(
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  reducedMotion = false
): PortalBoxDimensions {
  const isMobile = viewportWidth < 768;
  const baseW = isMobile ? 300 : 440;
  const baseH = isMobile ? 420 : 540;
  const p = clamp(progress, 0, 1);

  if (reducedMotion) {
    return p >= 0.5
      ? { width: viewportWidth, height: viewportHeight }
      : { width: baseW, height: baseH };
  }

  const expandT = clamp(p / 0.85, 0, 1);
  const eased = Math.pow(expandT, 1.85);
  return {
    width: Math.round(baseW + (viewportWidth - baseW) * eased),
    height: Math.round(baseH + (viewportHeight - baseH) * eased),
  };
}

/**
 * Computes individual slot metrics for the Dual 3D Mask Zoom Portals:
 * - Active portal centers (offsetX -> 0) and expands to full viewport bounds while revealing its interior.
 * - Inactive portal recedes smoothly into background depth (scale 0.94 -> 0.72, opacity -> 0).
 */
export function computeDualPortalMetrics(
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  portalId: PortalId,
  activePortal: PortalId,
  reducedMotion = false
): DualPortalSlotMetrics {
  const p = clamp(progress, 0, 1);
  const isDesktop = viewportWidth >= 768;
  const isActive = portalId === activePortal;

  const baseW = isDesktop ? Math.min(380, Math.floor((viewportWidth - 136) / 2)) : Math.min(296, viewportWidth - 52);
  const baseH = isDesktop ? Math.min(470, viewportHeight - 190) : Math.min(380, viewportHeight - 250);
  const desktopSideOffset = isDesktop ? Math.round(baseW * 0.5 + 22) : 0;
  const initialOffsetX = isDesktop
    ? portalId === 'workspace'
      ? -desktopSideOffset
      : desktopSideOffset
    : 0;

  const state = computePortalTransform(p, reducedMotion);

  if (isActive) {
    const centerT = reducedMotion ? (p >= 0.5 ? 1 : 0) : clamp(p / 0.45, 0, 1);
    const easedCenterT = 1 - Math.pow(1 - centerT, 2);
    const offsetX = Math.round(initialOffsetX * (1 - easedCenterT));

    const expandT = reducedMotion ? (p >= 0.5 ? 1 : 0) : clamp(p / 0.85, 0, 1);
    const easedExpand = Math.pow(expandT, 1.85);
    const width = Math.round(baseW + (viewportWidth - baseW) * easedExpand);
    const height = Math.round(baseH + (viewportHeight - baseH) * easedExpand);
    const perspectiveScale = Number((1200 / (1200 - state.innerTranslateZ)).toFixed(4));

    return {
      width,
      height,
      offsetX,
      scale: 1,
      opacity: 1,
      borderRadiusTop: state.borderRadiusTop,
      borderRadiusBottom: state.borderRadiusBottom,
      borderAlpha: p >= 0.85 ? 0 : 0.85,
      previewOpacity: state.previewOpacity,
      previewScale: state.previewScale,
      innerOpacity: state.innerOpacity,
      innerScale: perspectiveScale,
      isReceding: false,
    };
  }

  // Inactive portal recedes into depth as user scrolls into the active portal
  const recedeT = reducedMotion ? (p >= 0.5 ? 1 : 0) : clamp(p / 0.35, 0, 1);
  const scale = Number((0.94 - recedeT * 0.22).toFixed(3));
  const opacity = Number(((isDesktop ? 0.78 : 0.9) * (1 - recedeT)).toFixed(3));

  return {
    width: baseW,
    height: baseH,
    offsetX: initialOffsetX,
    scale,
    opacity,
    borderRadiusTop: 220,
    borderRadiusBottom: 28,
    borderAlpha: Number((0.42 * (1 - recedeT)).toFixed(3)),
    previewOpacity: 1,
    previewScale: 1,
    innerOpacity: 0,
    innerScale: 0.85,
    isReceding: true,
  };
}

/**
 * Toggles a project card's flipped state cleanly in a Set-like array.
 */
export function toggleFlippedProjectId(
  flippedIds: readonly string[],
  projectId: string
): string[] {
  if (flippedIds.includes(projectId)) {
    return flippedIds.filter((id) => id !== projectId);
  }
  return [...flippedIds, projectId];
}

export function computeParticleSpeed(baseSpeed: number, portalZoomVelocity: number): number {
  const safeVelocity = clamp(portalZoomVelocity, 0, 1);
  return Number((baseSpeed * (1 + safeVelocity * 4)).toFixed(4));
}

export function getBrandDisplayName(viewportWidth: number): string {
  return viewportWidth < 768 ? 'Fazle' : 'Muhammad Fazle Ferino';
}

export function filterProjectsByTech(
  projects: readonly ProjectItem[],
  selectedTech: string | null
): ProjectItem[] {
  if (!selectedTech) {
    return [...projects];
  }
  const normalized = selectedTech.toLowerCase();
  return projects.filter((project) =>
    project.tags.some((tag) => tag.toLowerCase() === normalized) ||
    project.desc.toLowerCase().includes(normalized) ||
    project.architecture.toLowerCase().includes(normalized)
  );
}

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

export function validateContactForm(input: ContactFormInput): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim();
  const trimmedMessage = input.message.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (trimmedMessage.length < 10) {
    errors.message = 'Please include a message of at least 10 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Computes smoothed 0..100 integer progress for the opening Preloader.
 * Uses ease-out-cubic progression and immediately returns 100 under reduced motion.
 */
export function computePreloaderProgress(
  elapsedMs: number,
  durationMs = 1400,
  reducedMotion = false
): number {
  if (reducedMotion || durationMs <= 0) {
    return 100;
  }
  const t = clamp(elapsedMs / durationMs, 0, 1);
  const eased = 1 - Math.pow(1 - t, 2.4);
  return Math.round(eased * 100);
}

/**
 * Formats a Date into HH:MM:SS in Asia/Jakarta (WIB) timezone for the live header clock.
 */
export function formatYogyakartaTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export type CursorMode = 'default' | 'case' | 'link';

/**
 * Resolves contextual custom cursor state from the hovered DOM element descriptor.
 */
export function resolveCursorMode(
  dataCursor: string | null | undefined,
  tagName: string | null | undefined,
  role?: string | null
): CursorMode {
  if (dataCursor === 'case') return 'case';
  if (dataCursor === 'link') return 'link';
  const normalizedTag = (tagName ?? '').toUpperCase();
  if (normalizedTag === 'A' || normalizedTag === 'BUTTON' || role === 'button') {
    return 'link';
  }
  return 'default';
}

/**
 * Computes one spring-lerp step for smooth floating cursor / preview coordinates.
 */
export function computeSpringStep(
  current: number,
  target: number,
  stiffness = 0.18
): number {
  return current + (target - current) * clamp(stiffness, 0.01, 1);
}


