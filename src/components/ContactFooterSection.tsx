import { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import {
  validateContactForm,
  type ContactFormInput,
} from '../utils/portfolioEngine';

interface ContactFooterSectionProps {
  onNavigate: (sectionId: string) => void;
}

export function ContactFooterSection({ onNavigate }: ContactFooterSectionProps) {
  const [formState, setFormState] = useState<ContactFormInput>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [submittedData, setSubmittedData] = useState<ContactFormInput | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateContactForm(formState);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmittedData({
      name: formState.name.trim(),
      email: formState.email.trim(),
      message: formState.message.trim(),
    });
    setFormState({ name: '', email: '', message: '' });
  };

  return (
    <footer
      id="contact"
      className="relative z-20 bg-[#0B0D10] pt-24 pb-28 md:pb-16 px-5 md:px-8 border-t border-[rgba(226,184,107,0.14)]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#E2B86B] tabular-nums mb-3">
            05 / Connect
          </p>
          <h2
            className="font-display font-semibold text-[#F3F4F6] tracking-tight"
            style={{ fontSize: 'clamp(2rem, 3.8vw, 3.25rem)', textWrap: 'balance' }}
          >
            {PORTFOLIO_DATA.contact.title}
          </h2>
        </div>

        {/* Minimalist Contact Card */}
        <div className="rounded-2xl bg-[#151821] border border-[rgba(226,184,107,0.22)] p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Direct Channels */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-[#F3F4F6] mb-3">
                Let&rsquo;s build something resilient.
              </h3>
              <p className="text-sm text-[rgba(243,244,246,0.72)] leading-relaxed">
                Open to full-stack web collaborations, security engineering discussions, and CTF team initiatives from {PORTFOLIO_DATA.identity.location}.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-[rgba(226,184,107,0.16)]">
              <div>
                <span className="block text-xs text-[rgba(243,244,246,0.62)] mb-1">
                  GitHub Profile
                </span>
                <a
                  href={PORTFOLIO_DATA.contact.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm md:text-base font-semibold text-[#E2B86B] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B]"
                >
                  github.com/fazle-star
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              <div>
                <span className="block text-xs text-[rgba(243,244,246,0.62)] mb-1">
                  Academic Base
                </span>
                <p className="text-sm text-[#F3F4F6]/85">
                  {PORTFOLIO_DATA.identity.institution}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Clean Contact Form */}
          <div className="lg:col-span-7">
            {submittedData ? (
              <div
                data-testid="contact-success"
                className="h-full rounded-xl bg-[#0B0D10] border border-[rgba(226,184,107,0.3)] p-6 md:p-8 flex flex-col justify-center"
              >
                <div className="flex items-center gap-2.5 text-[#E2B86B] mb-3">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span className="font-display text-lg font-semibold">
                    Message Ready
                  </span>
                </div>
                <p className="text-sm text-[#F3F4F6]/85 leading-relaxed mb-5">
                  Thank you, <span className="font-semibold text-[#F3F4F6]">{submittedData.name}</span>. Your note has been prepared from <span className="text-[#E2B86B]">{submittedData.email}</span>. You can also reach out directly via GitHub or email.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${PORTFOLIO_DATA.identity.email}?subject=${encodeURIComponent(
                      `Portfolio Inquiry from ${submittedData.name}`
                    )}&body=${encodeURIComponent(submittedData.message)}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#E2B86B] text-[#0B0D10] text-xs font-semibold hover:bg-[#ecc983] transition-colors"
                  >
                    Open in Email Client
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="px-4 py-2.5 rounded-lg border border-[rgba(226,184,107,0.22)] text-xs font-medium text-[#F3F4F6]/80 hover:text-[#E2B86B] hover:border-[#E2B86B] transition-colors cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-medium text-[rgba(243,244,246,0.78)] mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={formState.name}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Your name"
                      aria-invalid={Boolean(errors.name)}
                      className="w-full rounded-lg bg-[#0B0D10] border border-[rgba(226,184,107,0.22)] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder:text-[rgba(243,244,246,0.35)] focus:outline-none focus:border-[#E2B86B] transition-colors"
                    />
                    {errors.name && (
                      <p role="alert" className="mt-1.5 text-xs text-[#E2B86B]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-medium text-[rgba(243,244,246,0.78)] mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => {
                        setFormState((prev) => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="you@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className="w-full rounded-lg bg-[#0B0D10] border border-[rgba(226,184,107,0.22)] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder:text-[rgba(243,244,246,0.35)] focus:outline-none focus:border-[#E2B86B] transition-colors"
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1.5 text-xs text-[#E2B86B]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-medium text-[rgba(243,244,246,0.78)] mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formState.message}
                    onChange={(e) => {
                      setFormState((prev) => ({ ...prev, message: e.target.value }));
                      if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                    }}
                    placeholder="Share project details, security topics, or collaboration ideas..."
                    aria-invalid={Boolean(errors.message)}
                    className="w-full rounded-lg bg-[#0B0D10] border border-[rgba(226,184,107,0.22)] px-4 py-2.5 text-sm text-[#F3F4F6] placeholder:text-[rgba(243,244,246,0.35)] focus:outline-none focus:border-[#E2B86B] transition-colors resize-none"
                  />
                  {errors.message && (
                    <p role="alert" className="mt-1.5 text-xs text-[#E2B86B]">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#E2B86B] text-[#0B0D10] text-sm font-semibold hover:bg-[#ecc983] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B86B]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Quiet Footer */}
        <div className="mt-12 pt-6 border-t border-[rgba(226,184,107,0.14)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[rgba(243,244,246,0.62)]">
          <p>
            &copy; 2026 {PORTFOLIO_DATA.identity.fullName} · {PORTFOLIO_DATA.identity.location}
          </p>
          <div className="flex items-center gap-5">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="hover:text-[#E2B86B] transition-colors"
            >
              Back to Top
            </a>
            <a
              href={PORTFOLIO_DATA.contact.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#E2B86B] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
