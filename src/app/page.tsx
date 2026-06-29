import React from 'react';
import Link from 'next/link';
import { HeroSearchBar } from '@/components/ui/HeroSearchBar';
import { ToolExplorer } from '@/components/ui/ToolExplorer';
import { ResearchCycle } from '@/components/ui/ResearchCycle';
import { HowToContribute } from '@/components/ui/HowToContribute';
import { SlidingSearchFaq } from '@/components/ui/SlidingSearchFaq';
import { ScrollFadeSection } from '@/components/ui/ScrollFadeSection';
import { ToolFilterProvider } from '@/components/ui/ToolFilterContext';
import { getTools } from '@/app/actions/toolActions';
import { Tool, Platform, ToolType } from '@prisma/client';
import { buildMetadata } from '@/lib/seo';

// Prerender at build time, then refresh the data from the database every 5 minutes (ISR).
export const revalidate = 300;

export const metadata = buildMetadata({
  description:
    "Discover the best open-source AI tools, hand-curated with live GitHub stats, install commands, and honest detail pages. Filter by platform and tool type.",
  path: "/",
});

type ToolWithCategories = Tool & { platforms: Platform[], toolTypes: ToolType[] };

// Helper function to match existing UI aesthetic defaults
function mapToolToCard(dbTool: ToolWithCategories, index: number) {
  // Dynamic distribution of preset colors to match previous static design feel
  const colors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-primary-fixed'];
  const icons = ['terminal', 'smart_toy', 'video_camera_front', 'code', 'cloud', 'api', 'edit_note'];

  // Format 12400 -> 12.4k
  const formatStars = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  // Combine platforms and toolTypes for the UI tags array
  const tags = [
    ...dbTool.platforms.map((p) => p.name),
    ...dbTool.toolTypes.map((t) => t.name)
  ];

  return {
    id: dbTool.id,
    name: dbTool.name,
    stars: formatStars(dbTool.stars),
    description: dbTool.description,
    author: dbTool.author ?? '',
    tags,
    icon: icons[index % icons.length], // Fallback when no logo was uploaded
    color: colors[index % colors.length], // Cycles through valid tailwind design colors
    logoUrl: dbTool.heroImageUrl ?? null, // Uploaded tool logo; takes precedence over the icon
  };
}

export default async function HomePage() {
  // FETCH DYNAMIC BACKEND DATA DIRECTLY IN THE COMPONENT!
  const toolsData = await getTools();
  
  const tools = toolsData.map((item: ToolWithCategories, index: number) => mapToolToCard(item, index));

  return (
    <ToolFilterProvider>
    <main className="flex-grow overflow-x-hidden">
      {/* Hero Search Section — premium glow + bold display, mirroring the About page */}
      <section className="relative overflow-hidden px-gutter pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Ambient radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.12),transparent_60%)] pointer-events-none z-0" />
        {/* Soft brand-gradient blob */}
        <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-[420px] h-[420px] bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/20 blur-[120px] rounded-full pointer-events-none z-0" />

        <div className="relative z-10 max-w-container-max mx-auto flex flex-col items-center text-center">
          <p className="animate-fade-in-up font-mono uppercase tracking-[0.3em] text-xs text-primary font-medium mb-6">
            Curated Open Source
          </p>

          <h1 className="animate-fade-in-up [animation-delay:80ms] text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.0] mb-6 max-w-4xl">
            Curated Open-Source{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Excellence
            </span>
          </h1>

          <p className="animate-fade-in-up [animation-delay:160ms] font-body-base text-on-surface-variant text-lg md:text-xl leading-relaxed mb-stack-lg max-w-2xl">
            Discover, deploy, and master the best tools built by the community. No noise, just signal.
          </p>

          <div className="animate-fade-in-up [animation-delay:240ms] w-full flex flex-col items-center">
            <HeroSearchBar />
          </div>
        </div>
      </section>

      {/* Functional category filters + the tools grid they drive */}
      <ScrollFadeSection>
        <ToolExplorer tools={tools} />
      </ScrollFadeSection>

      {/* Research Cycle Section */}
      <ScrollFadeSection>
        <ResearchCycle />
      </ScrollFadeSection>

      {/* How To Contribute Section */}
      <ScrollFadeSection>
        <HowToContribute />
      </ScrollFadeSection>

      {/* Sliding Search FAQ */}
      <ScrollFadeSection>
        <SlidingSearchFaq />
      </ScrollFadeSection>

      {/* Closing CTA — echoes the About page's CTA language */}
      <ScrollFadeSection>
        <section className="relative px-gutter py-32 border-t border-outline-variant/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,206,255,0.08),transparent_70%)] pointer-events-none z-0" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
              Find Your Next
              <br />
              Favorite Tool.
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-10">
              Browse the full index of curated open-source software — filtered by platform,
              type, and what actually matters.
            </p>
            <Link href="/tools">
              <button className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold hover:bg-primary-fixed shadow-lg shadow-primary/20 hover-lift">
                Explore All Tools
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <Link
              href="/tools/submit"
              className="group inline-flex items-center gap-1.5 mt-4 font-label-sm text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Know a great tool? Submit it
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </section>
      </ScrollFadeSection>

    </main>
    </ToolFilterProvider>
  );
}
