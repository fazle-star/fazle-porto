import { useEffect, useState } from 'react';
import { ArrowUpRight, Monitor, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PORTFOLIO_DATA, type ProjectItem } from '../data/portfolio';
import { filterProjectsByTech } from '../utils/portfolioEngine';
import type { PortfolioTheme } from '../utils/theme';

interface ProjectsSectionProps {
  activeTechFilter: string | null;
  onChangeTechFilter: (tech: string | null) => void;
  theme: PortfolioTheme;
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
  theme,
}: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [failedPreviews, setFailedPreviews] = useState<Record<string, boolean>>({});

  const visibleProjects = filterProjectsByTech(
    PORTFOLIO_DATA.projects.items,
    activeTechFilter
  );
  const portalRoot = document.getElementById('root');

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
            className="project-stack-list relative"
          >
            {visibleProjects.map((project, visibleIndex) => {
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
                  onClick={() => setSelectedProject(project)}
                  aria-label={`Open ${project.name} case study`}
                  className="project-stack-card group relative block w-full text-left rounded-2xl overflow-hidden border border-[rgba(226,184,107,0.3)] bg-[#151821] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B]"
                  style={{
                    top: `${88 + visibleIndex * 16}px`,
                    zIndex: visibleIndex + 1,
                  }}
                >
                  <div className="project-stack-card__image absolute inset-0">
                    {previewFailed ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#151821]">
                        <Monitor className="w-8 h-8 text-[#E2B86B] mb-2" aria-hidden="true" />
                        <span className="font-display text-lg font-semibold text-[#F3F4F6]">
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

                  <div className="project-detail-overlay absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="font-mono text-xs font-medium tracking-[0.14em] uppercase text-[#E2B86B]">
                        {indexCode} / {project.category}
                      </span>
                      <span className="font-mono text-xs text-[#F3F4F6]/70 tabular-nums">
                        {project.year}
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="max-w-3xl">
                        <h3 className="font-display text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight text-[#F3F4F6] mb-2">
                          {displayTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#F3F4F6]/80 line-clamp-2 mb-3">
                          {project.desc}
                        </p>
                        <p className="font-mono text-[10px] sm:text-xs text-[#F3F4F6]/65">
                          {project.tags.join(' · ')}
                        </p>
                      </div>
                      <span className="w-11 h-11 rounded-full border border-[#E2B86B] bg-[#E2B86B] text-[#0B0D10] flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5" aria-hidden="true" />
                      </span>
                    </div>
                    <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-[#F3F4F6]/55 mt-5">
                      Open case study
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Project Case Study Modal */}
      {selectedProject && portalRoot && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          data-testid="project-case-modal"
          data-theme={theme}
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
                    href="https://github.com/fazle-star"
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
        </div>,
        portalRoot
      )}
    </section>
  );
}
