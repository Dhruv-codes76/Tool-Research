import { permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Legacy `/tool/[id]` → `/tools/[slug]` redirect. Resolves the id to the tool's
 * canonical slug and issues a permanent (308) redirect so link equity from any
 * old id-based URL consolidates onto the slug URL. Falls back to the raw
 * identifier only if the tool or its slug can't be found.
 */
export default async function ToolRedirectPage({ params }: PageProps) {
  const { id } = await params;

  const tool = await prisma.tool.findFirst({
    where: { OR: [{ id }, { slug: id }, { repoUrl: { contains: `/${id}` } }] },
    select: { slug: true, id: true },
  });

  permanentRedirect(`/tools/${tool?.slug || tool?.id || id}`);
}
