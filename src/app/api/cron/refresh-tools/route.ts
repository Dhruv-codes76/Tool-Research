import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseGitHubUrl, getRepoState, getLatestRelease } from "@/lib/github";
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

// Sentinel `field` for a deleted/private repo — it maps to no Tool column, so
// the review UI treats it as an alert (Archive / Keep) rather than an "apply".
const REPO_DELETED = "__repo_deleted__";

/**
 * Flag a detected change into the review queue, deduped per (tool, field):
 *  - a PENDING change for the same field is updated in place (latest wins).
 *  - a change the admin already REJECTED with the *same* target value is NOT
 *    recreated, so dismissing an alert doesn't re-nag every run. A genuinely
 *    new value (e.g. a different avatar) still re-flags.
 * Returns true when a change was created or refreshed.
 */
async function flagChange(
  toolId: string,
  field: string,
  oldValue: string | null,
  newValue: string,
): Promise<boolean> {
  const pending = await prisma.toolChange.findFirst({
    where: { toolId, field, status: "PENDING" },
  });
  if (pending) {
    await prisma.toolChange.update({
      where: { id: pending.id },
      data: { oldValue, newValue, detectedAt: new Date() },
    });
    return true;
  }
  const dismissed = await prisma.toolChange.findFirst({
    where: { toolId, field, newValue, status: "REJECTED" },
  });
  if (dismissed) return false;

  await prisma.toolChange.create({
    data: { toolId, field, oldValue, newValue, source: "CRON", detectedAt: new Date() },
  });
  return true;
}

/**
 * Scheduled refresh (Vercel Cron, every 3 days). Re-checks each ACTIVE tool
 * against the GitHub API:
 *  - silently applies stars / forks / issues / version / license (trusted data)
 *  - flags MAJOR changes into the review queue for an admin decision rather
 *    than auto-applying them: owner icon (heroImageUrl), repo rename/transfer
 *    (repoUrl + display name), archived-upstream, download-asset lists, and —
 *    critically — a deleted/private repo, which is NEVER auto-removed.
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
      const [state, release] = await Promise.all([
        getRepoState(gh.owner, gh.repo),
        getLatestRelease(gh.owner, gh.repo),
      ]);

      // Transient failure (rate limit / 5xx): skip this tool this run. Never
      // treat it as a deletion.
      if (state.kind === "error") continue;

      // --- Repo deleted or made private → flag, never auto-remove ---
      if (state.kind === "deleted") {
        if (await flagChange(tool.id, REPO_DELETED, tool.repoUrl, "DELETED")) changesFlagged++;
        // Keep the cadence gate honest even though nothing else changed.
        await prisma.tool.update({
          where: { id: tool.id },
          data: { lastFetchedAt: new Date() },
        });
        continue;
      }

      // --- Silent auto-apply (trusted, no curation needed) ---
      await prisma.tool.update({
        where: { id: tool.id },
        data: {
          stars: state.stars,
          forks: state.forks,
          issues: state.issues,
          license: state.license || tool.license,
          version: release?.version || tool.version,
          lastUpdate: state.lastUpdate ? new Date(state.lastUpdate) : tool.lastUpdate,
          lastFetchedAt: new Date(),
        },
      });
      statsUpdated++;

      // --- Major changes → review queue (admin decides, never auto-applied) ---

      // Owner icon / avatar (we store it as heroImageUrl).
      if (state.avatarUrl && tool.heroImageUrl && state.avatarUrl !== tool.heroImageUrl) {
        if (await flagChange(tool.id, "heroImageUrl", tool.heroImageUrl, state.avatarUrl)) {
          changesFlagged++;
        }
      }

      // Rename / transfer: repos.get follows redirects, so a changed full_name
      // means the repo moved. Flag the new URL (repoUrl is the unique key), and
      // only propose a new display name when the current name was the old repo
      // name (avoids clobbering a curated custom name).
      const currentFull = `${gh.owner}/${gh.repo}`;
      if (state.fullName && state.fullName.toLowerCase() !== currentFull.toLowerCase()) {
        const newUrl = `https://github.com/${state.fullName}`;
        if (await flagChange(tool.id, "repoUrl", tool.repoUrl, newUrl)) changesFlagged++;

        const newShort = state.fullName.split("/")[1] ?? state.fullName;
        if (
          newShort &&
          tool.name.toLowerCase() === gh.repo.toLowerCase() &&
          newShort.toLowerCase() !== tool.name.toLowerCase()
        ) {
          if (await flagChange(tool.id, "name", tool.name, newShort)) changesFlagged++;
        }
      }

      // Archived upstream (repo went read-only).
      if (state.archived) {
        if (await flagChange(tool.id, "archived", "false", "true")) changesFlagged++;
      }

      // --- Download assets → review queue (curation required) ---
      if (release && release.assets.length > 0) {
        const proposed: DownloadAsset[] = release.assets
          .filter((a) => a.name && !isLikelyJunkAsset(a.name))
          .map((a) => ({
            label: guessAssetLabel(a.name),
            url: a.browser_download_url,
            ...guessAssetOsArch(a.name),
          }));

        const current = parseDownloadAssets(tool.downloadAssets);
        const currentUrls = new Set(current.map((a) => a.url));
        const proposedUrls = new Set(proposed.map((a) => a.url));
        const changed =
          proposed.length > 0 &&
          (proposedUrls.size !== currentUrls.size ||
            [...proposedUrls].some((u) => !currentUrls.has(u)));

        if (changed) {
          if (
            await flagChange(
              tool.id,
              "downloadAssets",
              tool.downloadAssets ?? "[]",
              JSON.stringify(proposed),
            )
          )
            changesFlagged++;
        }
      }
    } catch (err) {
      // Tolerate per-tool failures (rate limit, transient 5xx) and keep going.
      console.error(`[cron] refresh failed for ${tool.repoUrl}:`, err);
    }
  }

  // Revalidate the public surfaces + the admin review queue once, after the sweep.
  revalidatePath("/");
  revalidatePath("/tools");
  revalidatePath("/admin/review");

  return NextResponse.json({ checked, statsUpdated, changesFlagged, total: tools.length });
}
