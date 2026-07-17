import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-guard';
import { getMySubmissions, getSavedTools } from '@/app/actions/userActions';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'My Dashboard',
  description: 'Track your submitted tools and your saved wishlist on AI Tool Research.',
  path: '/dashboard',
  index: false, // private, per-user page
});

const COLORS = ['text-primary', 'text-secondary', 'text-tertiary', 'text-primary-fixed'];
const ICONS = ['terminal', 'smart_toy', 'video_camera_front', 'code', 'cloud', 'api', 'edit_note'];
const fmtStars = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n));

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  const { tab } = await searchParams;
  const initialTab = tab === 'saved' ? 'saved' : 'submissions';

  const [submissions, savedTools] = await Promise.all([getMySubmissions(), getSavedTools()]);

  // Serializable shapes for the client tabs.
  const subs = submissions.map((t) => ({
    id: t.id,
    slug: t.slug || t.id,
    name: t.name,
    description: t.description,
    logoUrl: t.heroImageUrl,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    publishedAt: t.publishedAt ? t.publishedAt.toISOString() : null,
    rejectionReason: t.rejectionReason,
    edits: t.edits,
  }));

  const saved = savedTools.map((t, i) => ({
    id: t.id,
    slug: t.slug || t.id,
    name: t.name,
    stars: fmtStars(t.stars),
    description: t.description,
    tags: [...t.platforms.map((p) => p.name), ...t.toolTypes.map((ty) => ty.name)],
    icon: ICONS[i % ICONS.length],
    color: COLORS[i % COLORS.length],
    logoUrl: t.heroImageUrl ?? null,
  }));

  return (
    <main className="flex-grow pt-28 pb-32 max-w-container-max mx-auto px-gutter w-full md:pt-32">
      <header className="mb-10">
        <Link
          href="/tools"
          className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-label-sm uppercase tracking-widest text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Explore tools
        </Link>
        <h1 className="font-display-lg text-4xl font-black tracking-tight text-white">Your dashboard</h1>
        <p className="mt-2 font-body-base text-on-surface-variant">
          The tools you&rsquo;ve submitted and the ones you&rsquo;ve saved.
        </p>
      </header>

      <DashboardTabs submissions={subs} saved={saved} initialTab={initialTab} />
    </main>
  );
}
