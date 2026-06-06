import React from 'react';
import { getTools } from '@/app/actions/toolActions';
import { ToolsListClient } from '@/components/tools/ToolsListClient';
import { Tool, Platform, ToolType } from '@prisma/client';

type ToolWithCategories = Tool & { platforms: Platform[]; toolTypes: ToolType[] };

export const metadata = {
  title: 'Open Source Directory | AI Tool Research',
  description: 'Explore the complete index of curated open source excellence. Filter by platform or tool type.',
};

// Prerender at build time, then refresh the data from the database every 5 minutes (ISR).
export const revalidate = 300;

function mapToolToCard(dbTool: ToolWithCategories, index: number) {
  const colors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-primary-fixed'];
  const icons = ['terminal', 'smart_toy', 'video_camera_front', 'code', 'cloud', 'api', 'edit_note'];

  const formatStars = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

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
    icon: icons[index % icons.length],
    color: colors[index % colors.length],
  };
}

export default async function ToolsPage() {
  // Fetch dynamic tools directly from SQLite using our Server Action
  const toolsData = await getTools();

  const tools = toolsData.map((item: ToolWithCategories, index: number) => mapToolToCard(item, index));

  // Only surface categories that actually have tools — derived from the tool set
  const allPlatforms = Array.from(new Set(toolsData.flatMap((t: ToolWithCategories) => t.platforms.map((p) => p.name))));
  const allTypes = Array.from(new Set(toolsData.flatMap((t: ToolWithCategories) => t.toolTypes.map((ty) => ty.name))));

  return (
    <main className="flex-grow pt-24 pb-32 max-w-container-max mx-auto px-gutter w-full">
      <header className="mb-12">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">
          Open Source Directory
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
          Explore our complete index of curated community excellence. Filter by category, platforms, or search for specific tools.
        </p>
      </header>

      <ToolsListClient 
        initialTools={tools}
        allPlatforms={allPlatforms}
        allTypes={allTypes}
      />
    </main>
  );
}
