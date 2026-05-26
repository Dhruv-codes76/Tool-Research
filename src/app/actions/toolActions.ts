"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRepoStats, parseGitHubUrl, detectCategories } from "@/lib/github";

/**
 * Server action to submit a new tool.
 */
export async function submitTool(formData: FormData, userId: string) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const repoUrl = formData.get("repoUrl") as string;
  const platformsInput = formData.get("platforms") as string; // Comma-separated
  const toolTypesInput = formData.get("toolTypes") as string; // Comma-separated

  // Validate required fields
  if (!name || !description || !repoUrl) {
    throw new Error("Required fields are missing.");
  }

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
      ? platformsInput.split(',').map(c => c.trim()).filter(c => c !== "")
      : detected.platforms;
      
    toolTypeNames = toolTypesInput 
      ? toolTypesInput.split(',').map(c => c.trim()).filter(c => c !== "")
      : detected.toolTypes;
  } else {
    platformNames = platformsInput 
      ? platformsInput.split(',').map(c => c.trim()).filter(c => c !== "")
      : ["Agnostic"];
      
    toolTypeNames = toolTypesInput 
      ? toolTypesInput.split(',').map(c => c.trim()).filter(c => c !== "")
      : ["Other"];
  }

  const tool = await prisma.tool.create({
    data: {
      name,
      description,
      repoUrl,
      userId,
      ...stats,
      status: 'ACTIVE', 
      lastFetchedAt: new Date(),
      platforms: {
        connectOrCreate: platformNames.map(name => ({
          where: { name },
          create: { name },
        })),
      },
      toolTypes: {
        connectOrCreate: toolTypeNames.map(name => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: {
      platforms: true,
      toolTypes: true,
    }
  });

  revalidatePath("/");
  return tool;
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
