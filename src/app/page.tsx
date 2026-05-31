import React from 'react';
import Link from 'next/link';
import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { getTools } from '@/app/actions/toolActions';
import { Tool, Platform, ToolType } from '@prisma/client';

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
    tags,
    icon: icons[index % icons.length], // Cycles through consistent aesthetic icons
    color: colors[index % colors.length], // Cycles through valid tailwind design colors
  };
}

export default async function HomePage() {
  // FETCH DYNAMIC BACKEND DATA DIRECTLY IN THE COMPONENT!
  const toolsData = await getTools();
  
  const tools = toolsData.map((item: ToolWithCategories, index: number) => mapToolToCard(item, index));

  return (
    <main className="flex-grow pt-24 pb-32 max-w-container-max mx-auto px-gutter w-full">
      {/* Hero Search Section */}
      <section className="flex flex-col items-center justify-center py-20">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md text-center">
          Curated Open-Source Excellence
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant mb-stack-lg text-center max-w-2xl">
          Discover, deploy, and master the best tools built by the community. No noise, just signal.
        </p>
        
        <SearchBar />

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mt-stack-lg">
          {['All Tools', 'Android', 'Windows', 'macOS', 'MCP Servers', 'AI Tools', 'Developer Tools', 'Others'].map((cat, i) => (
            <CategoryChip key={cat} label={cat} isActive={i === 0} />
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="mb-20">
        <div className="flex justify-between items-end mb-stack-md border-b border-outline-variant/20 pb-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Tools</h2>
          <Link className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1" href="/tools">
            VIEW ALL <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.length > 0 ? (
            tools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-on-surface-variant">
              No tools found in the database yet.
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
