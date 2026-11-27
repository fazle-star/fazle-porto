import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Monitor, X } from 'lucide-react';
import { PORTFOLIO_DATA, type ProjectItem } from '../data/portfolio';
import { clamp, computeSpringStep, filterProjectsByTech } from '../utils/portfolioEngine';

interface ProjectsSectionProps {
  activeTechFilter: string | null;
  onChangeTechFilter: (tech: string | null) => void;
}

const FILTER_OPTIONS = ['All', 'React', 'TypeScript', 'Python', 'Node.js', 'UI/UX'];

function getEditorialTitle(project: ProjectItem): string {
  if (project.id === 'pythonverse-learning-hub') {
    return 'PYTHONVERSE HUB';
  }
  return project.name.toUpperCase();
}

export function ProjectsSection({
  activeTechFilter,
  onChangeTechFilter,
}: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectItem | null>(null);
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>({});

  const previewCardRef = useRef<HTMLDivElement | null>(null);
  const targetPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const visibleProjects = filterProjectsByTech(
    PORTFOLIO_DATA.projects.items,
    activeTechFilter
  );

  // Keyboard Escape handler + body scroll lock when full-screen case study modal is open
  useEffect(() => {
    if (!selectedProject) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  // Spring-animated floating preview card following the mouse cursor on desktop hover
  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer || !hoveredProject) return;

    let rafId = 0;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const nextX = computeSpringStep(
        currentPosRef.current.x,
        targetPosRef.current.x,
        0.15
      );
      const nextY = computeSpringStep(
        currentPosRef.current.y,
        targetPosRef.current.y,
        0.15
      );

      const dx = targetPosRef.current.x - currentPosRef.current.x;
      const tiltDeg = clamp(dx * 0.04, -3.5, 3.5);

      currentPosRef.current = { x: nextX, y: nextY };

      if (previewCardRef.current) {
        previewCardRef.current.style.transform = `translate3d(${nextX.toFixed(1)}px, ${nextY.toFixed(1)}px, 0) rotate(${tiltDeg.toFixed(2)}deg)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [hoveredProject]);

  const handleRowPointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const cardW = 380;
    const cardH = 240;
    const rawX = e.clientX + 28;
    const rawY = e.clientY - cardH * 0.52;
    targetPosRef.current = {
      x: clamp(rawX, 24, window.innerWidth - cardW - 24),
      y: clamp(rawY, 84, window.innerHeight - cardH - 24),
    };
  };

  const handleRowEnter = (
    project: ProjectItem,
    e?: React.MouseEvent<HTMLElement>
  ) => {
    if (e) {
      const cardW = 380;
      const cardH = 240;
      const clampedX = clamp(e.clientX + 28, 24, window.innerWidth - cardW - 24);
      const clampedY = clamp(
        e.clientY - cardH * 0.52,
        84,
        window.innerHeight - cardH - 24
      );
      targetPosRef.current = { x: clampedX, y: clampedY };
      if (!hoveredProject) {
        currentPosRef.current = { x: clampedX, y: clampedY };
      }
    }
    setHoveredProject(project);
  };

  return (
    <section
      id="projects"
      className="relative z-20 bg-[#0B0D10]/82 py-24 md:py-32 px-5 sm:px-8 lg:px-12 border-t border-[rgba(243,244,246,0.12)]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.16em] uppercase text-[#E2B86B] tabular-nums mb-3">
              03 / Selected Index
            </p>
            <h2
              className="font-display font-semibold text-[#F3F4F6] tracking-tight"
              style={{ fontSize: 'clamp(2.1rem, 4vw, 3.5rem)', textWrap: 'balance' }}
            >
              {PORTFOLIO_DATA.projects.title}
            </h2>
          </div>

          {/* Interactive Filter Controls */}
          <div
            role="group"
            aria-label="Filter projects by technology"
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#151821] border border-[rgba(226,184,107,0.22)]"
          >
            {FILTER_OPTIONS.map((option) => {
              const isAll = option === 'All';
              const isActive = isAll
                ? activeTechFilter === null
                : activeTechFilter?.toLowerCase() === option.toLowerCase();

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChangeTechFilter(isAll ? null : option)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B86B] ${
                    isActive
                      ? 'bg-[#E2B86B] text-[#0B0D10] font-semibold'
                      : 'text-[#F3F4F6]/70 hover:text-[#F3F4F6]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty filter fallback state */}
        {visibleProjects.length === 0 ? (
          <div className="border-y border-[rgba(243,244,246,0.14)] py-14 text-center">
            <p className="text-base font-medium text-[#F3F4F6] mb-2">
              No featured projects match &ldquo;{activeTechFilter}&rdquo;.
            </p>
            <p className="text-sm text-[rgba(243,244,246,0.62)] mb-5">
              This technology is part of my broader engineering toolkit. View all featured systems below.
            </p>
            <button
              type="button"
              onClick={() => onChangeTechFilter(null)}
              className="px-5 py-2.5 rounded-lg bg-[#E2B86B] text-[#0B0D10] text-xs font-semibold cursor-pointer hover:bg-[#ecc983] transition-colors"
            >
              Show All Projects
            </button>
          </div>
        ) : (
          <div
            data-testid="projects-index-list"
            onMouseLeave={() => setHoveredProject(null)}
            className="border-b border-[rgba(243,244,246,0.14)]"
          >
            {visibleProjects.map((project) => {
              const originalIndex =
                PORTFOLIO_DATA.projects.items.findIndex((p) => p.id === project.id) + 1;
              const indexCode = String(originalIndex).padStart(2, '0');
              const displayTitle = getEditorialTitle(project);
              const previewFailed = Boolean(failedPreviews[project.id]);

              return (
                <button
                  key={project.id}
                  type="button"
                  data-cursor="case"
                  data-testid={`project-row-${project.id}`}
                  onClick={() => {
                    setHoveredProject(null);
                    setSelectedProject(project);
                  }}
                  onMouseEnter={(e) => handleRowEnter(project, e)}
                  onMouseMove={handleRowPointerMove}
                  onMouseLeave={() => setHoveredProject(null)}
                  aria-label={`Open ${project.name} case study`}
                  className="group w-full text-left border-t border-[rgba(243,244,246,0.14)] py-7 md:py-9 px-1 md:px-3 transition-colors duration-200 hover:bg-[#151821]/45 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#E2B86B]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center gap-4 md:gap-6">
                    {/* Index & Category */}
                    <div className="md:col-span-2 flex items-center md:flex-col md:items-start justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-[#E2B86B] tabular-nums">
                        {indexCode}
                      </span>
                      <span className="text-xs text-[rgba(243,244,246,0.58)]">
                        {project.category} · <span className="tabular-nums">{project.year}</span>
                      </span>
                    </div>

                    {/* Oversized Editorial Title (Slides right in Champagne Gold on desktop hover) */}
                    <div className="md:col-span-6 overflow-hidden">
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-semibold tracking-tight text-[#F3F4F6] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:translate-x-5 group-hover:text-[#E2B86B]">
                        <span className="font-mono text-base sm:text-lg text-[#E2B86B]/75 mr-3 tabular-nums md:hidden">
                          {indexCode}
                        </span>
                        {displayTitle}
                      </h3>
                    </div>

                    {/* Summary, Unboxed Stack & Action Arrow */}
                    <div className="md:col-span-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm text-[rgba(243,244,246,0.78)] line-clamp-2 mb-1.5">
                          {project.desc}
                        </p>
                        <p className="font-mono text-[11px] text-[rgba(243,244,246,0.56)] truncate">
                          {project.tags.join(' · ')}
                        </p>
                      </div>

                      <span className="w-10 h-10 rounded-full border border-[rgba(226,184,107,0.25)] group-hover:border-[#E2B86B] group-hover:bg-[#E2B86B] group-hover:text-[#0B0D10] text-[#E2B86B] flex items-center justify-center transition-all duration-200 shrink-0">
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  {/* Mobile Compact Screenshot Preview (< 768px) */}
                  <div className="mt-4 md:hidden rounded-xl overflow-hidden border border-[rgba(226,184,107,0.22)] bg-[#151821] aspect-[16/9]">
                    {previewFailed ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Monitor className="w-6 h-6 text-[#E2B86B] mb-1.5" aria-hidden="true" />
                        <span className="font-display text-sm font-semibold text-[#F3F4F6]">
                          {project.name}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={project.previewImage}
                        alt={project.previewAlt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedPreviews((prev) => ({ ...prev, [project.id]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Spring-Animated Floating Cursor Preview Card */}
      {hoveredProject && !selectedProject && (
        <div
          ref={previewCardRef}
          data-testid="floating-project-preview"
          aria-hidden="true"
          className="hidden md:block fixed top-0 left-0 z-[140] w-[360px] lg:w-[390px] pointer-events-none"
        >
          <div className="rounded-xl overflow-hidden border border-[#E2B86B]/60 bg-[#151821] shadow-[0_24px_70px_rgba(0,0,0,0.72)]">
            <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B0D10]">
              {failedPreviews[hoveredProject.id] ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                  <Monitor className="w-8 h-8 text-[#E2B86B] mb-2" />
                  <span className="font-display text-lg font-semibold text-[#F3F4F6]">
                    {hoveredProject.name}
                  </span>
                </div>
              ) : (
                <img
                  src={hoveredProject.previewImage}
                  alt={hoveredProject.previewAlt}
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedPreviews((prev) => ({
                      ...prev,
                      [hoveredProject.id]: true,
                    }))
                  }
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-[rgba(226,184,107,0.2)] flex items-center justify-between gap-3 bg-[#151821]">
              <span className="font-display text-sm font-semibold text-[#F3F4F6] truncate">
                {getEditorialTitle(hoveredProject)}
              </span>
              <span className="font-mono text-[11px] text-[#E2B86B] whitespace-nowrap shrink-0">
                {hoveredProject.category} · {hoveredProject.year}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Project Case Study Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          data-testid="project-case-modal"
          className="fixed inset-0 z-[200] bg-[#0B0D10]/96 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="min-h-screen max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-8 md:py-14 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[rgba(243,244,246,0.14)]">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#E2B86B]">
                Case Study · {selectedProject.category} · {selectedProject.year}
              </p>

              <button
                type="button"
                aria-label="Close case study modal"
                data-testid="project-modal-close"
                onClick={() => setSelectedProject(null)}
                className="w-11 h-11 rounded-full border border-[rgba(226,184,107,0.3)] flex items-center justify-center text-[#F3F4F6]/85 hover:text-[#E2B86B] hover:border-[#E2B86B] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[rgba(226,184,107,0.3)] bg-[#151821] aspect-[16/10]">
                {failedPreviews[selectedProject.id] ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                    <Monitor className="w-10 h-10 text-[#E2B86B] mb-3" aria-hidden="true" />
                    <span className="font-display text-2xl font-semibold text-[#F3F4F6]">
                      {selectedProject.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={selectedProject.previewImage}
                    alt={selectedProject.previewAlt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <h3
                    id="project-modal-title"
                    className="font-display text-3xl sm:text-4xl font-semibold text-[#F3F4F6] tracking-tight mb-4"
                  >
                    {selectedProject.name}
                  </h3>

                  <p className="text-base text-[#F3F4F6]/90 leading-relaxed mb-6">
                    {selectedProject.architecture}
                  </p>

                  <p className="font-mono text-xs font-semibold tracking-[0.12em] uppercase text-[rgba(243,244,246,0.58)] mb-3">
                    Key Implementation Highlights
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {selectedProject.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="text-sm text-[#F3F4F6]/82 flex items-start gap-2.5"
                      >
                        <span aria-hidden="true" className="text-[#E2B86B] mt-0.5">
                          ·
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-[rgba(243,244,246,0.14)] flex flex-wrap items-center justify-between gap-4">
                  <div className="font-mono text-xs text-[rgba(243,244,246,0.62)]">
                    {selectedProject.tags.join(' · ')}
                  </div>

                  <a
                    href={selectedProject.repoPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="project-modal-github"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#E2B86B] text-[#0B0D10] text-xs font-semibold hover:bg-[#ecc983] transition-colors whitespace-nowrap shrink-0"
                  >
                    View Repository on GitHub
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
