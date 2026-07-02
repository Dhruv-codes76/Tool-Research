"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { withErrorHandling } from "@/lib/errors";
import {
  guessAssetLabel,
  guessAssetOsArch,
  isLikelyJunkAsset,
  type DownloadAsset,
} from "@/lib/install";
import {
  sendSubmissionApprovedEmail,
  sendSubmissionRejectedEmail,
} from "@/lib/email";

export async function getAdminStats() {
  await requireAdmin();
  
  const [total, active, pending] = await Promise.all([
    prisma.tool.count({ where: { status: { not: 'DELETED' } } }),
    prisma.tool.count({ where: { status: 'ACTIVE' } }),
    prisma.tool.count({ where: { status: 'PENDING' } }),
  ]);
  
  return {
    total,
    active,
    pending,
  };
}

export async function getAllToolsAdmin() {
  await requireAdmin();
  
  return prisma.tool.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      platforms: true,
      toolTypes: true,
    }
  });
}

export async function getToolByIdAdmin(id: string) {
  await requireAdmin();

  return prisma.tool.findUnique({
    where: { id },
    include: {
      platforms: true,
      toolTypes: true,
    }
  });
}

export async function deleteTool(id: string) {
  const admin = await requireAdmin();

  const tool = await prisma.tool.update({
    where: { id },
    data: { status: 'DELETED' }
  });

  await logAudit({
    action: "tool.delete",
    actor: admin,
    targetType: "Tool",
    targetId: id,
    targetLabel: tool.name,
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export async function restoreTool(id: string) {
  const admin = await requireAdmin();

  const tool = await prisma.tool.update({
    where: { id },
    data: { status: 'DRAFT' } // Restore as DRAFT for safety
  });

  await logAudit({
    action: "tool.restore",
    actor: admin,
    targetType: "Tool",
    targetId: id,
    targetLabel: tool.name,
  });

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
}

export type ToolAdminFormData = {
  name: string;
  description: string;
  repoUrl: string;
  stars: number;
  forks: number;
  issues: number;
  status: string;
  aboutText: string;
  metaDescription: string;
  version: string;
  license: string;
  installCommand: string;
  heroImageUrl: string;
  galleryImages: string; // JSON string
  galleryLayout: string;
  features: string; // JSON string
  author: string;
  authorUrl: string;
  since: string;
  websiteUrl: string;
  downloadUrl: string;
  downloadAssets: string; // JSON string of curated DownloadAsset[]
  slug: string;
  platforms: string[]; // array of names
  toolTypes: string[]; // array of names
};

export async function createTool(data: ToolAdminFormData) {
  return withErrorHandling(async () => {
    const admin = await requireAdmin();
    
    const { platforms, toolTypes, ...toolData } = data;

    // Backend duplicate blocks
    if (!(await checkSlugUnique(toolData.slug))) {
      throw new Error(`The slug "${toolData.slug}" is already taken.`);
    }
    if (toolData.websiteUrl || toolData.repoUrl) {
      const urlToCheck = toolData.websiteUrl || toolData.repoUrl;
      const existing = await checkUrlExists(urlToCheck);
      if (existing) {
        throw new Error(`The URL is already used by another tool (${existing.name}).`);
      }
    }

    const tool = await prisma.tool.create({
      data: {
        ...toolData,
        userId: admin.id,
        platforms: {
          connectOrCreate: platforms.map(name => ({
            where: { name },
            create: { name },
          })),
        },
        toolTypes: {
          connectOrCreate: toolTypes.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      }
    });

    await logAudit({
      action: "tool.create",
      actor: admin,
      targetType: "Tool",
      targetId: tool.id,
      targetLabel: tool.name,
      metadata: { repoUrl: tool.repoUrl, status: tool.status, platforms, toolTypes },
    });

    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    return tool;
  });
}

export async function updateTool(id: string, data: ToolAdminFormData) {
  return withErrorHandling(async () => {
    const admin = await requireAdmin();

    const { platforms, toolTypes, ...toolData } = data;

    // Backend duplicate blocks
    if (!(await checkSlugUnique(toolData.slug, id))) {
      throw new Error(`The slug "${toolData.slug}" is already taken.`);
    }
    if (toolData.websiteUrl || toolData.repoUrl) {
      const urlToCheck = toolData.websiteUrl || toolData.repoUrl;
      const existing = await checkUrlExists(urlToCheck, id);
      if (existing) {
        throw new Error(`The URL is already used by another tool (${existing.name}).`);
      }
    }

    // We need to overwrite platforms and toolTypes. Prisma 'set' replaces existing connections.
    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...toolData,
        platforms: {
          set: [], // Clear existing
          connectOrCreate: platforms.map(name => ({
            where: { name },
            create: { name },
          })),
        },
        toolTypes: {
          set: [], // Clear existing
          connectOrCreate: toolTypes.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      }
    });

    await logAudit({
      action: "tool.update",
      actor: admin,
      targetType: "Tool",
      targetId: tool.id,
      targetLabel: tool.name,
      metadata: { status: tool.status, platforms, toolTypes },
    });

    revalidatePath("/admin/tools");
    revalidatePath("/tools");
    revalidatePath(`/tools/${id}`);
    return tool;
  });
}

export async function checkSlugUnique(slug: string, excludeId?: string) {
  await requireAdmin();
  const whereClause: any = { slug };
  if (excludeId) {
    whereClause.id = { not: excludeId };
  }
  const count = await prisma.tool.count({ where: whereClause });
  return count === 0;
}

export async function checkUrlExists(url: string, excludeId?: string) {
  await requireAdmin();
  const whereClause: any = {
    OR: [
      { websiteUrl: url },
      { repoUrl: url }
    ],
    status: { not: 'DELETED' }
  };
  if (excludeId) {
    whereClause.id = { not: excludeId };
  }
  const existing = await prisma.tool.findFirst({
    where: whereClause,
    select: { name: true, slug: true }
  });
  return existing;
}

export async function getCategories() {
  await requireAdmin();
  
  const [platforms, toolTypes] = await Promise.all([
    prisma.platform.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tools: true }
        }
      }
    }),
    prisma.toolType.findMany({ 
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { tools: true }
        }
      }
    })
  ]);
  
  return { platforms, toolTypes };
}

export async function createPlatform(name: string, description?: string) {
  const admin = await requireAdmin();
  const platform = await prisma.platform.create({ data: { name, description } });
  await logAudit({
    action: "platform.create",
    actor: admin,
    targetType: "Platform",
    targetId: platform.id,
    targetLabel: platform.name,
  });
  revalidatePath("/admin/categories");
  return platform;
}

export async function deletePlatform(id: string) {
  const admin = await requireAdmin();

  const platform = await prisma.platform.findUnique({
    where: { id },
    include: { _count: { select: { tools: true } } }
  });

  if (platform && platform._count.tools > 0) {
    throw new Error("Cannot delete platform because it is associated with tools.");
  }

  await prisma.platform.delete({ where: { id } });
  await logAudit({
    action: "platform.delete",
    actor: admin,
    targetType: "Platform",
    targetId: id,
    targetLabel: platform?.name,
  });
  revalidatePath("/admin/categories");
}

export async function updatePlatform(id: string, name: string, description?: string) {
  const admin = await requireAdmin();
  const platform = await prisma.platform.update({
    where: { id },
    data: { name, description }
  });
  await logAudit({
    action: "platform.update",
    actor: admin,
    targetType: "Platform",
    targetId: platform.id,
    targetLabel: platform.name,
  });
  revalidatePath("/admin/categories");
  return platform;
}

export async function createToolType(name: string, description?: string) {
  const admin = await requireAdmin();
  const toolType = await prisma.toolType.create({ data: { name, description } });
  await logAudit({
    action: "toolType.create",
    actor: admin,
    targetType: "ToolType",
    targetId: toolType.id,
    targetLabel: toolType.name,
  });
  revalidatePath("/admin/categories");
  return toolType;
}

export async function deleteToolType(id: string) {
  const admin = await requireAdmin();

  const toolType = await prisma.toolType.findUnique({
    where: { id },
    include: { _count: { select: { tools: true } } }
  });

  if (toolType && toolType._count.tools > 0) {
    throw new Error("Cannot delete tool category because it is associated with tools.");
  }

  await prisma.toolType.delete({ where: { id } });
  await logAudit({
    action: "toolType.delete",
    actor: admin,
    targetType: "ToolType",
    targetId: id,
    targetLabel: toolType?.name,
  });
  revalidatePath("/admin/categories");
}

export async function updateToolType(id: string, name: string, description?: string) {
  const admin = await requireAdmin();
  const toolType = await prisma.toolType.update({
    where: { id },
    data: { name, description }
  });
  await logAudit({
    action: "toolType.update",
    actor: admin,
    targetType: "ToolType",
    targetId: toolType.id,
    targetLabel: toolType.name,
  });
  revalidatePath("/admin/categories");
  return toolType;
}

export async function fetchGitHubMetadata(repoUrl: string) {
  await requireAdmin();

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Tool-Search-Admin',
  };

  if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`;
  }

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { 
      headers, 
      cache: 'no-store' 
    });
    
    if (!repoRes.ok) {
      throw new Error(`Failed to fetch repo: ${repoRes.statusText}`);
    }
    const repoData = await repoRes.json();

    const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers,
      cache: 'no-store'
    });
    const releaseData = releaseRes.ok ? await releaseRes.json() : null;

    // Build curated download-asset suggestions from the latest release: drop
    // obvious junk (checksums, signatures, source tarballs) and pre-label the
    // rest. The admin can still edit / add / remove these in the form.
    const downloadAssets: DownloadAsset[] = Array.isArray(releaseData?.assets)
      ? releaseData.assets
          .filter((a: { name?: string }) => a?.name && !isLikelyJunkAsset(a.name))
          .map((a: { name: string; browser_download_url: string }) => ({
            label: guessAssetLabel(a.name),
            url: a.browser_download_url,
            ...guessAssetOsArch(a.name),
          }))
      : [];

    return {
      name: repoData.name || '',
      description: repoData.description || '',
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      issues: repoData.open_issues_count || 0,
      license: repoData.license?.spdx_id || repoData.license?.name || '',
      heroImageUrl: repoData.owner?.avatar_url || '',
      author: repoData.owner?.login || '',
      authorUrl: repoData.owner?.html_url || '',
      since: repoData.created_at ? new Date(repoData.created_at).getFullYear().toString() : '',
      websiteUrl: repoData.homepage || '',
      version: releaseData?.tag_name || '',
      downloadAssets,
      topics: repoData.topics || [],
    };

  } catch (error: any) {
    console.error("GitHub fetch error:", error);
    throw new Error(error.message || "Failed to fetch GitHub metadata");
  }
}

// ---------------------------------------------------------------------------
// Review queue — download-asset curation flagged by the refresh cron
// ---------------------------------------------------------------------------

export async function getPendingChanges() {
  await requireAdmin();

  return prisma.toolChange.findMany({
    where: { status: "PENDING" },
    include: { tool: true },
    orderBy: { detectedAt: "desc" },
  });
}

export async function getPendingChangeCount() {
  await requireAdmin();
  return prisma.toolChange.count({ where: { status: "PENDING" } });
}

/**
 * Apply an admin-curated download-asset list to the tool and resolve the change.
 * `curatedAssets` is the edited JSON string the admin confirmed in the review UI.
 */
export async function publishDownloadCuration(changeId: string, curatedAssets: string) {
  const admin = await requireAdmin();

  const change = await prisma.toolChange.findUnique({ where: { id: changeId }, include: { tool: true } });
  if (!change) throw new Error("Change not found");

  await prisma.$transaction([
    prisma.tool.update({
      where: { id: change.toolId },
      data: { downloadAssets: curatedAssets },
    }),
    prisma.toolChange.update({
      where: { id: changeId },
      data: { status: "APPROVED", resolvedAt: new Date() },
    }),
  ]);

  await logAudit({
    action: "toolChange.publish",
    actor: admin,
    targetType: "Tool",
    targetId: change.toolId,
    targetLabel: change.tool?.name,
    metadata: { changeId, field: change.field, oldValue: change.oldValue, newValue: curatedAssets },
  });

  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath(`/tools/${change.toolId}`);
  revalidatePath("/admin/tools");
  revalidatePath("/admin/review");
}

export async function rejectChange(changeId: string) {
  const admin = await requireAdmin();

  const change = await prisma.toolChange.update({
    where: { id: changeId },
    data: { status: "REJECTED", resolvedAt: new Date() },
  });

  await logAudit({
    action: "toolChange.reject",
    actor: admin,
    targetType: "ToolChange",
    targetId: changeId,
    targetLabel: change.field,
    metadata: { toolId: change.toolId },
  });

  revalidatePath("/admin/review");
}

// ---------------------------------------------------------------------------
// User-submission review queue
// ---------------------------------------------------------------------------

/**
 * Returns all tools submitted by users that are awaiting admin review.
 * Ordered newest-first so the admin sees the most recent submissions at the top.
 */
export async function getPendingSubmissions() {
  await requireAdmin();

  return prisma.tool.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: {
      platforms: true,
      toolTypes: true,
    },
  });
}

/**
 * Approve a user-submitted tool.
 * Sets status → DRAFT so the admin can enrich details before publishing live.
 * Sends an approval email to the submitter (best-effort, never throws).
 */
export async function approveSubmission(
  toolId: string,
  editedData?: { 
    name: string; 
    description: string; 
    repoUrl: string; 
    websiteUrl: string | null;
    aboutText?: string | null;
    heroImageUrl?: string | null;
    galleryImages?: string | null;
    features?: string | null;
    installCommand?: string | null;
    license?: string | null;
    version?: string | null;
    since?: string | null;
    downloadUrl?: string | null;
  }
) {
  const admin = await requireAdmin();

  const dataToUpdate: Record<string, any> = { status: 'ACTIVE' };
  if (editedData) {
    dataToUpdate.name = editedData.name;
    dataToUpdate.description = editedData.description;
    dataToUpdate.repoUrl = editedData.repoUrl;
    dataToUpdate.websiteUrl = editedData.websiteUrl;
    
    if (editedData.aboutText !== undefined) dataToUpdate.aboutText = editedData.aboutText;
    if (editedData.heroImageUrl !== undefined) dataToUpdate.heroImageUrl = editedData.heroImageUrl;
    if (editedData.galleryImages !== undefined) dataToUpdate.galleryImages = editedData.galleryImages;
    if (editedData.features !== undefined) dataToUpdate.features = editedData.features;
    if (editedData.installCommand !== undefined) dataToUpdate.installCommand = editedData.installCommand;
    if (editedData.license !== undefined) dataToUpdate.license = editedData.license;
    if (editedData.version !== undefined) dataToUpdate.version = editedData.version;
    if (editedData.since !== undefined) dataToUpdate.since = editedData.since;
    if (editedData.downloadUrl !== undefined) dataToUpdate.downloadUrl = editedData.downloadUrl;
  }

  const tool = await prisma.tool.update({
    where: { id: toolId },
    data: dataToUpdate,
  });

  // Fire-and-forget email — captured in a void so the action never awaits it
  if (tool.submittedByEmail) {
    void sendSubmissionApprovedEmail(tool.submittedByEmail, tool.name);
  }

  await logAudit({
    action: 'tool.approve',
    actor: admin,
    targetType: 'Tool',
    targetId: tool.id,
    targetLabel: tool.name,
    metadata: { submittedByEmail: tool.submittedByEmail, edited: !!editedData },
  });

  revalidatePath('/admin/submissions');
  revalidatePath('/admin/tools');
  revalidatePath('/');
  revalidatePath('/tools');

  return { success: true };
}

/**
 * Reject a user-submitted tool.
 * Sets status → REJECTED and optionally stores the admin's reason.
 * Sends a rejection email to the submitter (best-effort, never throws).
 */
export async function rejectSubmission(toolId: string, reason?: string) {
  const admin = await requireAdmin();

  const tool = await prisma.tool.update({
    where: { id: toolId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason ?? null,
    },
  });

  if (tool.submittedByEmail) {
    void sendSubmissionRejectedEmail(tool.submittedByEmail, tool.name, reason);
  }

  await logAudit({
    action: 'tool.reject',
    actor: admin,
    targetType: 'Tool',
    targetId: tool.id,
    targetLabel: tool.name,
    metadata: { reason, submittedByEmail: tool.submittedByEmail },
  });

  revalidatePath('/admin/submissions');
}
