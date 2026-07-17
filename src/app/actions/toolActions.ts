"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRepoStats, parseGitHubUrl, detectCategories } from "@/lib/github";
import { logAudit } from "@/lib/audit-log";
import { withErrorHandling, AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth-guard";

/** Normalise a string into a URL-safe slug. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Return a slug guaranteed unique against the Tool table. slug is the sole
 * public URL identifier and is DB-unique, so a collision would otherwise throw
 * on insert. Appends -2, -3, … until a free slug is found.
 */
async function ensureUniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "tool";
  let candidate = root;
  let n = 1;
  // Bounded loop — the counter guarantees eventual termination.
  while (await prisma.tool.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

/**
 * Server action to submit a new tool.
 */
export async function submitTool(formData: FormData, userId: string, submitterEmail: string) {
  return withErrorHandling(async () => {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const repoUrl = formData.get("repoUrl") as string;
  let slug = formData.get("slug") as string;
  const websiteUrl = (formData.get("websiteUrl") as string) || '';
  const platformsInput = formData.get("platforms") as string; // Comma-separated
  const toolTypesInput = formData.get("toolTypes") as string; // Comma-separated

  // Validate required fields
  if (!name || !description || !repoUrl) {
    throw new AppError("Required fields are missing.", "VALIDATION_ERROR");
  }
  
  // slug is the sole public URL. Fall back to the name, then guarantee it is
  // unique so the DB unique constraint never rejects the submission.
  slug = await ensureUniqueSlug(slug || name);

  // Fetch live stats from GitHub
  const githubInfo = parseGitHubUrl(repoUrl);
  let stats = { stars: 0, forks: 0, issues: 0 };
  
  if (githubInfo) {
    const fetchedStats = await getRepoStats(githubInfo.owner, githubInfo.repo);
    if (fetchedStats) {
      stats = {
        stars: fetchedStats.stars,
        forks: fetchedStats.forks,
        issues: fetchedStats.issues,
      };
    }
  }

  // Detect categories if not provided
  let platformNames: string[] = [];
  let toolTypeNames: string[] = [];

  if (githubInfo && (!platformsInput || !toolTypesInput)) {
    const detected = await detectCategories(githubInfo.owner, githubInfo.repo, description);
    
    platformNames = platformsInput 
      ? platformsInput.split(',').map((c: any) => c.trim()).filter(c => c !== "")
      : detected.platforms;
      
    toolTypeNames = toolTypesInput 
      ? toolTypesInput.split(',').map((c: any) => c.trim()).filter(c => c !== "")
      : detected.toolTypes;
  } else {
    platformNames = platformsInput 
      ? platformsInput.split(',').map((c: any) => c.trim()).filter(c => c !== "")
      : ["Agnostic"];
      
    toolTypeNames = toolTypesInput 
      ? toolTypesInput.split(',').map((c: any) => c.trim()).filter(c => c !== "")
      : ["Other"];
  }

  const tool = await prisma.tool.create({
    data: {
      name,
      slug,
      description,
      repoUrl,
      websiteUrl,
      status: 'PENDING',
      userId,
      submittedByEmail: submitterEmail,
      ...stats,
      lastFetchedAt: new Date(),
      platforms: {
        connectOrCreate: platformNames.map((n: any) => ({
          where: { name: n },
          create: { name: n },
        })),
      },
      toolTypes: {
        connectOrCreate: toolTypeNames.map((n: any) => ({
          where: { name: n },
          create: { name: n },
        })),
      },
    },
    include: {
      platforms: true,
      toolTypes: true,
    }
  });

  await logAudit({
    action: "tool.submit",
    actor: { id: userId },
    targetType: "Tool",
    targetId: tool.id,
    targetLabel: tool.name,
    metadata: { repoUrl, platforms: platformNames, toolTypes: toolTypeNames },
  });

  revalidatePath("/");
  return tool;
  });
}

/**
 * Server action to get all published tools.
 */
export async function getTools(query?: string, platform?: string, toolType?: string) {
  return prisma.tool.findMany({
    where: {
      status: 'ACTIVE',
      ...(query && {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      }),
      ...(platform && {
        platforms: {
          some: {
            name: platform,
          },
        },
      }),
      ...(toolType && {
        toolTypes: {
          some: {
            name: toolType,
          },
        },
      }),
    },
    include: {
      platforms: true,
      toolTypes: true,
    },
    orderBy: {
      stars: "desc",
    },
  });
}

/**
 * Server action to get a single tool by repo URL.
 */
export async function getToolByUrl(url: string) {
  return prisma.tool.findUnique({
    where: { repoUrl: url },
    include: { 
      platforms: true,
      toolTypes: true,
    },
  });
}

/**
 * Server action to refresh stats for a specific tool.
 */
export async function refreshToolStats(toolId: string) {
  const tool = await prisma.tool.findUnique({
    where: { id: toolId },
  });

  if (!tool) throw new Error("Tool not found");

  const githubInfo = parseGitHubUrl(tool.repoUrl);
  if (!githubInfo) return tool;

  const fetchedStats = await getRepoStats(githubInfo.owner, githubInfo.repo);
  if (!fetchedStats) return tool;

  const updatedTool = await prisma.tool.update({
    where: { id: toolId },
    data: {
      stars: fetchedStats.stars,
      forks: fetchedStats.forks,
      issues: fetchedStats.issues,
      lastFetchedAt: new Date(),
    },
    include: { 
      platforms: true,
      toolTypes: true,
    },
  });

  revalidatePath("/");
  return updatedTool;
}

/**
 * Lean community submission. The submitter provides only a repo URL plus
 * (optionally) a description, images, and categories — everything heavy (slug,
 * SEO, taxonomy polish) is the admin's job in the review modal. The values the
 * submitter provided are snapshotted so the dashboard can later show exactly
 * what the admin changed before publishing.
 */
export type ToolSubmissionInput = {
  repoUrl: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  author?: string;
  authorUrl?: string;
  license?: string;
  version?: string;
  since?: string;
  heroImageUrl?: string;
  galleryImages?: string; // JSON string of string[]
  galleryLayout?: string;
  downloadAssets?: string; // JSON string of DownloadAsset[]
  toolTypes?: string[];
  platforms?: string[];
};

export async function submitToolRequest(input: ToolSubmissionInput) {
  return withErrorHandling(async () => {
    // Resolve identity server-side — never trust a client-passed userId.
    const user = await getCurrentUser();
    if (!user) {
      throw new AppError("You must be signed in to submit a tool.", "UNAUTHORIZED");
    }

    const repoUrl = input.repoUrl?.trim();
    const name = input.name?.trim();
    if (!repoUrl) throw new AppError("A GitHub repository URL is required.", "VALIDATION_ERROR");
    if (!name) throw new AppError("Could not read the tool name — try fetching again.", "VALIDATION_ERROR");
    if (!parseGitHubUrl(repoUrl)) {
      throw new AppError("That doesn't look like a valid GitHub repository URL.", "VALIDATION_ERROR");
    }

    // Reject a repo that's already in the directory (any status but deleted).
    const existing = await prisma.tool.findFirst({
      where: { repoUrl, status: { not: "DELETED" } },
      select: { status: true },
    });
    if (existing) {
      throw new AppError(
        existing.status === "PENDING"
          ? "This tool has already been submitted and is awaiting review."
          : "This tool is already in the directory.",
        "CONFLICT",
      );
    }

    // Auto-generate a unique slug — the admin can refine it before publishing.
    const slug = await ensureUniqueSlug(name);

    // Live stats, fetched server-side for integrity.
    let stats = { stars: 0, forks: 0, issues: 0 };
    const githubInfo = parseGitHubUrl(repoUrl);
    if (githubInfo) {
      const fetched = await getRepoStats(githubInfo.owner, githubInfo.repo);
      if (fetched) stats = { stars: fetched.stars, forks: fetched.forks, issues: fetched.issues };
    }

    const platforms = input.platforms ?? [];
    const toolTypes = input.toolTypes ?? [];

    // Snapshot exactly what the submitter provided, before any admin edit.
    const snapshot = {
      name,
      description: input.description ?? "",
      websiteUrl: input.websiteUrl ?? "",
      author: input.author ?? "",
      authorUrl: input.authorUrl ?? "",
      license: input.license ?? "",
      version: input.version ?? "",
      since: input.since ?? "",
      heroImageUrl: input.heroImageUrl ?? "",
      galleryImages: input.galleryImages ?? "[]",
      galleryLayout: input.galleryLayout ?? "16:9",
      toolTypes,
      platforms,
    };

    const tool = await prisma.tool.create({
      data: {
        name,
        slug,
        description: input.description ?? "",
        repoUrl,
        websiteUrl: input.websiteUrl ?? "",
        author: input.author || null,
        authorUrl: input.authorUrl || null,
        license: input.license || null,
        version: input.version || null,
        since: input.since || null,
        heroImageUrl: input.heroImageUrl || null,
        galleryImages: input.galleryImages ?? "[]",
        galleryLayout: input.galleryLayout ?? "16:9",
        downloadAssets: input.downloadAssets ?? "[]",
        status: "PENDING",
        userId: user.id,
        submittedByEmail: user.email ?? null,
        submissionSnapshot: JSON.stringify(snapshot),
        ...stats,
        lastFetchedAt: new Date(),
        platforms: {
          connectOrCreate: platforms.map((n) => ({ where: { name: n }, create: { name: n } })),
        },
        toolTypes: {
          connectOrCreate: toolTypes.map((n) => ({ where: { name: n }, create: { name: n } })),
        },
      },
      include: { platforms: true, toolTypes: true },
    });

    await logAudit({
      action: "tool.submit",
      actor: { id: user.id },
      targetType: "Tool",
      targetId: tool.id,
      targetLabel: tool.name,
      metadata: { repoUrl, platforms, toolTypes },
    });

    revalidatePath("/admin/submissions");
    return tool;
  });
}

import { isLikelyJunkAsset, guessAssetLabel, guessAssetOsArch, DownloadAsset } from '@/lib/install';

export async function fetchPublicGitHubMetadata(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'AI-Tool-Search',
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
