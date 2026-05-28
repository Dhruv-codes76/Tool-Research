"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  await requireAdmin();
  
  const [total, active, draft] = await Promise.all([
    prisma.tool.count(),
    prisma.tool.count({ where: { status: 'ACTIVE' } }),
    prisma.tool.count({ where: { status: 'DRAFT' } })
  ]);
  
  return {
    total,
    active,
    pending: draft
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

export async function deleteTool(id: string) {
  await requireAdmin();
  
  await prisma.tool.update({
    where: { id },
    data: { status: 'DELETED' }
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
  platforms: string[]; // array of names
  toolTypes: string[]; // array of names
};

export async function createTool(data: ToolAdminFormData) {
  const admin = await requireAdmin();
  
  const { platforms, toolTypes, ...toolData } = data;

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

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  return tool;
}

export async function updateTool(id: string, data: ToolAdminFormData) {
  await requireAdmin();
  
  const { platforms, toolTypes, ...toolData } = data;

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

  revalidatePath("/admin/tools");
  revalidatePath("/tools");
  revalidatePath(`/tools/${id}`);
  return tool;
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
  await requireAdmin();
  const platform = await prisma.platform.create({ data: { name, description } });
  revalidatePath("/admin/categories");
  return platform;
}

export async function deletePlatform(id: string) {
  await requireAdmin();
  
  const platform = await prisma.platform.findUnique({
    where: { id },
    include: { _count: { select: { tools: true } } }
  });
  
  if (platform && platform._count.tools > 0) {
    throw new Error("Cannot delete platform because it is associated with tools.");
  }

  await prisma.platform.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function updatePlatform(id: string, name: string, description?: string) {
  await requireAdmin();
  const platform = await prisma.platform.update({
    where: { id },
    data: { name, description }
  });
  revalidatePath("/admin/categories");
  return platform;
}

export async function createToolType(name: string, description?: string) {
  await requireAdmin();
  const toolType = await prisma.toolType.create({ data: { name, description } });
  revalidatePath("/admin/categories");
  return toolType;
}

export async function deleteToolType(id: string) {
  await requireAdmin();

  const toolType = await prisma.toolType.findUnique({
    where: { id },
    include: { _count: { select: { tools: true } } }
  });
  
  if (toolType && toolType._count.tools > 0) {
    throw new Error("Cannot delete tool category because it is associated with tools.");
  }

  await prisma.toolType.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

export async function updateToolType(id: string, name: string, description?: string) {
  await requireAdmin();
  const toolType = await prisma.toolType.update({
    where: { id },
    data: { name, description }
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

    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { 
      headers: { ...headers, 'Accept': 'application/vnd.github.v3.raw' },
      cache: 'no-store' 
    });
    const readmeData = readmeRes.ok ? await readmeRes.text() : '';

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
      aboutText: readmeData || '',
      topics: repoData.topics || [], 
    };

  } catch (error: any) {
    console.error("GitHub fetch error:", error);
    throw new Error(error.message || "Failed to fetch GitHub metadata");
  }
}

