import React from 'react';
import { getTools } from '@/app/actions/toolActions';
import { ToolsListClient } from '@/components/tools/ToolsListClient';
import { Tool, Platform, ToolType } from '@prisma/client';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata, graph, breadcrumbSchema, collectionPageSchema } from '@/lib/seo';

type ToolWithCategories = Tool & { platforms: Platform[]; toolTypes: ToolType[] };

const PAGE_DESCRIPTION =
  'Browse the complete index of curated open-source AI tools, plus the closed-source picks worth knowing. Filter by source, platform, or tool type.';

export const metadata = buildMetadata({
  title: 'Open-Source AI Tool Directory',
  description: PAGE_DESCRIPTION,
  path: '/tools',
});

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
    ...dbTool.toolTypes.map((t: any) => t.name)
  ];

  return {
    id: dbTool.id,
    slug: dbTool.slug || dbTool.id,
    name: dbTool.name,
    stars: formatStars(dbTool.stars),
    description: dbTool.description,
    author: dbTool.author ?? '',
    tags,
    icon: icons[index % icons.length], // Fallback when no logo was uploaded
    color: colors[index % colors.length],
    logoUrl: dbTool.heroImageUrl ?? null, // Uploaded tool logo; takes precedence over the icon
    sourceType: dbTool.sourceType, // Drives the "not open source" card variant + filter
  };
}

export default async function ToolsPage() {
  // Fetch dynamic tools directly from SQLite using our Server Action
  const toolsData = await getTools();

  const tools = toolsData.map((item: ToolWithCategories, index: number) => mapToolToCard(item, index));

  // Only surface categories that actually have tools — derived from the tool set
  const allPlatforms = Array.from(new Set(toolsData.flatMap((t: ToolWithCategories) => t.platforms.map((p: any) => p.name))));
  const allTypes = Array.from(new Set(toolsData.flatMap((t: ToolWithCategories) => t.toolTypes.map((ty: any) => ty.name))));

  return (
    <main className="flex-grow pt-24 pb-32 max-w-container-max mx-auto px-gutter w-full">
      <JsonLd
        data={graph(
          collectionPageSchema({
            name: 'Open-Source AI Tool Directory',
            description: PAGE_DESCRIPTION,
            path: '/tools',
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
          ]),
        )}
      />
      <header className="mb-12">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-md">
          The Tool Directory
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant max-w-2xl">
          Our complete index — open-source tools first, plus the closed-source ones we think
          are worth knowing about. Filter by source, category, or platform.
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
