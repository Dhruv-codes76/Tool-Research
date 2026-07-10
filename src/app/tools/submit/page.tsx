import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-guard';
import { SubmitToolForm } from '@/components/tools/SubmitToolForm';
import { prisma } from '@/lib/prisma';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Submit a Tool',
  description:
    'Know a great open-source AI tool? Submit it to the AI Tool Research directory for manual review.',
  path: '/tools/submit',
});

export default async function SubmitToolPage() {
  // Verify the user is authenticated — redirect to login if not.
  // getCurrentUser() honours the dev bypass cookie in development.
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/tools/submit');
  }

  // Fetch taxonomy options to power the pill selectors in the form.
  const [platforms, toolTypes] = await Promise.all([
    prisma.platform.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
    prisma.toolType.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
  ]);


  return (
    <main className="flex-grow overflow-x-hidden">
      {/* Page hero */}
      <section className="relative overflow-hidden px-gutter pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.08),transparent_60%)] pointer-events-none z-0" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[300px] h-[300px] bg-gradient-to-br from-primary/15 via-secondary/10 to-tertiary/15 blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-label-sm text-on-surface-variant uppercase tracking-widest hover:text-on-surface transition-colors mb-6"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to directory
          </Link>

          <p className="font-mono uppercase tracking-[0.3em] text-xs text-primary font-medium mb-4">
            Community Submission
          </p>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.05] mb-4">
            Submit a Tool
          </h1>

          <p className="font-body-base text-on-surface-variant text-base md:text-lg leading-relaxed max-w-lg mx-auto">
            Know an open-source AI tool that belongs in the directory? Paste the GitHub URL and we'll take it from there.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-gutter pb-32">
        <div className="max-w-2xl mx-auto">
          <SubmitToolForm
            userId={user.id}
            userEmail={user.email || ''}
            availablePlatforms={platforms.map((p: any) => p.name)}
            availableToolTypes={toolTypes.map((t: any) => t.name)}
          />
        </div>
      </section>
    </main>
  );
}
