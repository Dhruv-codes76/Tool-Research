import React from 'react';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How AI Tool Research collects, uses, and protects your data. Privacy is the default — we curate openness, and we treat your information the same way.',
  path: '/privacy',
});

const LAST_UPDATED = 'June 4, 2026';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    body: [
      'AI Tool Research ("we", "us", or "the platform") is a manually curated dictionary of open-source AI tools hosted on GitHub. We believe privacy should be the default, not a setting you have to find. This policy explains, in plain language, what data we collect, why we collect it, and the control you keep over it.',
      'By using aitoolresearch.com you agree to the practices described here. If you do not agree, please discontinue use of the platform.',
    ],
  },
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    body: [
      'We deliberately collect as little as possible. The data we do handle falls into three categories:',
    ],
    list: [
      'Account data — if you are an editor or administrator, we store your email address, authentication identifiers, and role. Visitors browsing the tool dictionary do not need an account.',
      'Usage data — anonymised, aggregate analytics such as page views and referring sources, used only to understand which tools the community finds useful.',
      'Submitted content — when a curator submits a GitHub URL, we fetch and store that repository’s public metadata (stars, forks, license, README) from the GitHub API. This is public information about the project, not personal data about you.',
    ],
  },
  {
    id: 'how-we-use-it',
    title: 'How We Use Your Information',
    body: ['We use the limited data we collect strictly to operate and improve the platform:'],
    list: [
      'To authenticate editors and administrators and secure the curation workflow.',
      'To display accurate, up-to-date metadata on curated tool pages.',
      'To measure aggregate interest so we can prioritise which tools to curate next.',
      'To send essential, transactional emails (such as admin invitations and password resets).',
    ],
  },
  {
    id: 'what-we-dont-do',
    title: 'What We Will Never Do',
    body: [
      'We do not sell your data. We do not harvest behavioural profiles for advertisers. We do not embed third-party trackers that follow you around the web. The platform exists to champion open, user-respecting software — surveilling our own visitors would contradict everything we stand for.',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-Party Services',
    body: [
      'To run the platform we rely on a small set of trusted infrastructure providers, each processing data only on our behalf:',
    ],
    list: [
      'Supabase — authentication and secure storage of tool screenshots.',
      'GitHub — public repository metadata for curated tools.',
      'Resend — delivery of transactional administrative emails.',
      'Sanity — content management for our editorial blog.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: [
      'We use only the cookies strictly necessary to keep authenticated editors signed in and to keep the platform secure. We do not use advertising or cross-site tracking cookies. You can clear or block cookies in your browser at any time, though doing so may sign you out of the admin area.',
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention & Security',
    body: [
      'We retain account data for as long as an editor or administrator account remains active, and remove it on request. All data is transmitted over encrypted connections and access to administrative systems is restricted by role-based permissions.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    body: [
      'You can request access to, correction of, or deletion of any personal data we hold about you. Because we collect so little, most of these requests are quick to honour. To exercise any of these rights, contact us using the details below.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    body: [
      'We may update this policy as the platform evolves. When we make material changes we will revise the "last updated" date at the top of this page. Continued use of the platform after a change constitutes acceptance of the revised policy.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: [
      'Questions about your privacy or this policy are always welcome. Reach us at privacy@aitoolresearch.com and we will respond as quickly as we can.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-on-surface selection:bg-primary selection:text-on-primary overflow-x-hidden pt-16 font-sans">
      {/* Hero */}
      <section className="relative py-32 md:py-40 px-6 overflow-hidden border-b border-outline-variant/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.1),transparent_60%)] pointer-events-none z-0" />
        <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in-up">
          <p className="text-primary uppercase tracking-[0.3em] text-xs mb-6 font-mono font-medium">
            Main / Privacy
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-8 lowercase">
            Privacy
            <br />
            Policy
          </h1>
          <p className="max-w-2xl mx-auto text-on-surface-variant text-lg md:text-xl leading-relaxed">
            We champion software that respects its users. We hold ourselves to the
            same standard — collecting only what we must, and never trading on
            your trust.
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
                <span className="text-primary font-mono text-base">§</span>
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
                      <span className="text-primary font-bold mt-1 shrink-0">→</span>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,206,255,0.08),transparent_70%)] pointer-events-none z-0" />
        <div className="relative max-w-3xl mx-auto text-center z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
            Read Our Terms
          </h2>
          <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-10">
            Privacy is one half of the agreement. The Terms of Service explain the
            rest of how we work together.
          </p>
          <Link href="/terms">
            <button className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold hover:scale-105 hover:bg-primary-fixed duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              View Terms of Service
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
