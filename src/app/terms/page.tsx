import React from 'react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description:
    'The terms that govern your use of AI Tool Research — a manually curated dictionary of open-source AI tools. Clear, fair, and written in plain language.',
  path: '/terms',
});

const LAST_UPDATED = 'June 4, 2026';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    body: [
      'These Terms of Service ("Terms") govern your access to and use of aitoolresearch.com (the "platform"), operated by AI Tool Research. By accessing or using the platform you agree to be bound by these Terms. If you do not agree, please do not use the platform.',
    ],
  },
  {
    id: 'what-we-provide',
    title: 'What We Provide',
    body: [
      'AI Tool Research is a manually curated "Tool Dictionary" for open-source AI tools hosted on GitHub. Human editors review and publish each entry. We aggregate public repository metadata — stars, forks, licenses, and documentation — to present a high-signal, premium discovery experience.',
      'The platform is provided for informational and discovery purposes. We are not affiliated with, and do not endorse, the projects we catalogue unless explicitly stated.',
    ],
  },
  {
    id: 'use-of-platform',
    title: 'Acceptable Use',
    body: ['When using the platform, you agree that you will not:'],
    list: [
      'Scrape, harvest, or systematically extract the curated dictionary for republication without permission.',
      'Attempt to gain unauthorised access to the admin area, accounts, or underlying infrastructure.',
      'Interfere with, disrupt, or overload the platform or its supporting services.',
      'Use the platform for any unlawful purpose or to infringe the rights of others.',
    ],
  },
  {
    id: 'curated-content',
    title: 'Curated Content & Accuracy',
    body: [
      'We work hard to keep tool metadata accurate, pulling live data from the GitHub API. However, repository statistics change constantly and third-party data can contain errors. We provide curated information "as is" and make no warranty as to its completeness, accuracy, or timeliness. Always verify critical details — particularly licensing — directly with the source project before relying on them.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    body: [
      'The platform’s design, editorial writing, branding, and original curation are the property of AI Tool Research and are protected by applicable intellectual-property laws. The open-source projects we feature remain the property of their respective authors and are governed by their own licenses, which we link to wherever possible.',
      'You may share links to our pages freely. You may not reproduce substantial portions of our editorial content as your own.',
    ],
  },
  {
    id: 'third-party-links',
    title: 'Third-Party Links & Software',
    body: [
      'The platform contains links to external repositories, websites, and downloads. We do not control these destinations and are not responsible for their content, security, or licensing. Downloading and running open-source software is done entirely at your own risk and subject to that software’s own terms.',
    ],
  },
  {
    id: 'accounts',
    title: 'Editor & Administrator Accounts',
    body: [
      'Access to the curation tools is limited to invited editors and administrators. If you hold such an account, you are responsible for keeping your credentials secure and for all activity that occurs under your account. We reserve the right to suspend or revoke access that is misused or that violates these Terms.',
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer of Warranties',
    body: [
      'The platform is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied, including but not limited to fitness for a particular purpose and non-infringement. We do not warrant that the platform will be uninterrupted, error-free, or secure.',
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    body: [
      'To the fullest extent permitted by law, AI Tool Research shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform or any software you discover through it. Your sole remedy for dissatisfaction with the platform is to stop using it.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    body: [
      'We may revise these Terms from time to time as the platform evolves. When we make material changes we will update the "last updated" date above. Continuing to use the platform after a change means you accept the revised Terms.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: [
      'If you have questions about these Terms, reach us at hello@aitoolresearch.com and we will be happy to help.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-on-surface selection:bg-primary selection:text-on-primary overflow-x-hidden pt-16 font-sans">
      {/* Hero */}
      <section className="relative py-32 md:py-40 px-6 overflow-hidden border-b border-outline-variant/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(137,206,255,0.1),transparent_60%)] pointer-events-none z-0" />
        <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in-up">
          <p className="text-secondary uppercase tracking-[0.3em] text-xs mb-6 font-mono font-medium">
            Main / Terms
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-8 lowercase">
            Terms of
            <br />
            Service
          </h1>
          <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl leading-relaxed">
            Clear, fair, and written in plain language — the agreement that lets us
            curate open-source excellence and lets you discover it with confidence.
          </p>
          <p className="mt-8 text-sm font-mono text-on-surface-variant/60 tracking-wider uppercase">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          {sections.map((section) => (
            <article key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tight flex items-baseline gap-3">
                <span className="text-secondary font-mono text-base">§</span>
                {section.title}
              </h2>
              <div className="space-y-4 text-on-surface-variant text-base md:text-lg leading-relaxed">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              {section.list && (
                <ul className="mt-6 space-y-3">
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-on-surface-variant text-base md:text-lg leading-relaxed"
                    >
                      <span className="text-secondary font-bold mt-1 shrink-0">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-32 px-6 border-t border-outline-variant/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(195,192,255,0.08),transparent_70%)] pointer-events-none z-0" />
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
            How We Handle Data
          </h2>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-10">
            Curious what we collect and why? Our Privacy Policy lays it out in the
            same plain language.
          </p>
          <Link href="/privacy">
            <button className="group px-8 py-4 rounded-full bg-secondary text-on-secondary font-bold hover:scale-105 duration-300 shadow-lg shadow-secondary/20 hover:shadow-secondary/30 transition-all">
              View Privacy Policy
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
