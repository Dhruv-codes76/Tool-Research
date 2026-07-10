import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseGitHubUrl, getRepoStats, getLatestRelease } from "@/lib/github";
import {
  guessAssetLabel,
  guessAssetOsArch,
  isLikelyJunkAsset,
  parseDownloadAssets,
  type DownloadAsset,
} from "@/lib/install";

// GitHub calls over every ACTIVE tool can take a while — allow a longer budget.
export const maxDuration = 300;

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Scheduled refresh (Vercel Cron, every 3 days). Re-checks each ACTIVE tool
 * against the GitHub API:
 *  - silently applies stars / forks / issues / version / license (trusted data)
 *  - flags download-asset changes into the review queue for human curation
 *    (raw asset lists contain junk + cryptic names, so they're never auto-published)
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the
 * CRON_SECRET env var is set. `?force=1` bypasses the per-tool 3-day gate (testing).
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "1";

  const tools = await prisma.tool.findMany({ where: { status: "ACTIVE" } });

  let checked = 0;
  let statsUpdated = 0;
  let changesFlagged = 0;

  for (const tool of tools) {
    // Per-tool gate keeps each tool on a real ~3-day cadence even if the cron
    // fires more often (retries, daily schedule, etc.).
    if (!force && tool.lastFetchedAt && Date.now() - tool.lastFetchedAt.getTime() < THREE_DAYS_MS) {
      continue;
    }

    const gh = parseGitHubUrl(tool.repoUrl);
    if (!gh) continue;

    try {
      checked++;
      const [stats, release] = await Promise.all([
        getRepoStats(gh.owner, gh.repo),
        getLatestRelease(gh.owner, gh.repo),
      ]);
      if (!stats) continue;

      // --- Silent auto-apply (trusted, no curation needed) ---
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          stars: stats.stars,
          forks: stats.forks,
          issues: stats.issues,
          license: stats.license || tool.license,
          version: release?.version || tool.version,
          lastUpdate: stats.lastUpdate ? new Date(stats.lastUpdate) : tool.lastUpdate,
          lastFetchedAt: new Date(),
        },
      });
      statsUpdated++;

      // --- Download assets → review queue (curation required) ---
      if (release && release.assets.length > 0) {
        const proposed: DownloadAsset[] = release.assets
          .filter((a) => a.name && !isLikelyJunkAsset(a.name))
          .map((a: any) => ({
            label: guessAssetLabel(a.name),
            url: a.browser_download_url,
            ...guessAssetOsArch(a.name),
          }));

        const current = parseDownloadAssets(tool.downloadAssets);
        const currentUrls = new Set(current.map((a: any) => a.url));
        const proposedUrls = new Set(proposed.map((a: any) => a.url));
        const changed =
          proposed.length > 0 &&
          (proposedUrls.size !== currentUrls.size ||
            [...proposedUrls].some((u) => !currentUrls.has(u)));

        if (changed) {
          const existing = await prisma.toolChange.findFirst({
            where: { toolId: tool.id, field: "downloadAssets", status: "PENDING" },
          });
          const payload = {
            oldValue: tool.downloadAssets ?? "[]",
            newValue: JSON.stringify(proposed),
            detectedAt: new Date(),
          };
          if (existing) {
            await prisma.toolChange.update({ where: { id: existing.id }, data: payload });
          } else {
            await prisma.toolChange.create({
              data: { toolId: tool.id, field: "downloadAssets", source: "CRON", ...payload },
            });
          }
          changesFlagged++;
        }
      }
    } catch (err) {
      // Tolerate per-tool failures (rate limit, transient 5xx) and keep going.
      console.error(`[cron] refresh failed for ${tool.repoUrl}:`, err);
    }
  }

  // Revalidate the public surfaces once, after the whole sweep.
  revalidatePath("/");
  revalidatePath("/tools");

  return NextResponse.json({ checked, statsUpdated, changesFlagged, total: tools.length });
}
