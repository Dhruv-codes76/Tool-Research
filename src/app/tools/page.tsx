import React from 'react';
import { getTools } from '@/app/actions/toolActions';
import { ToolsListClient } from '@/components/tools/ToolsListClient';

export const metadata = {
  title: 'All Open Source Tools | AI Tool Research',
  description: 'Explore the complete index of curated open source excellence. Filter by platform or tool type.',
};

function mapToolToCard(dbTool: any, index: number) {
  const colors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-primary-fixed'];
  const icons = ['terminal', 'smart_toy', 'video_camera_front', 'code', 'cloud', 'api', 'edit_note'];

  const formatStars = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  const tags = [
    ...dbTool.platforms.map((p: any) => p.name),
    ...dbTool.toolTypes.map((t: any) => t.name)
  ];

  return {
    id: dbTool.id,
    name: dbTool.name,
    stars: formatStars(dbTool.stars),
    description: dbTool.description,
    tags,
    icon: icons[index % icons.length],
    color: colors[index % colors.length],
  };
}

export default async function ToolsPage() {
  // Fetch dynamic tools directly from SQLite using our Server Action
  const toolsData = await getTools();
  
  const tools = toolsData.map((item: any, index: number) => mapToolToCard(item, index));

  // Extract distinct platforms and tool types for the filtering chips
  const allPlatforms = Array.from(new Set(toolsData.flatMap((t: any) => t.platforms.map((p: any) => p.name))));
  const allTypes = Array.from(new Set(toolsData.flatMap((t: any) => t.toolTypes.map((ty: any) => ty.name))));

  return (
    <main className="flex-grow pt-24 pb-32 max-w-container-max mx-auto px-gutter w-full">
      <header className="mb-12">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">
          All Open Source Tools
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
