import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

/**
 * Enhanced GitHub URL parsing to handle various formats (HTTPS, clean URLs, etc.).
 */
export function parseGitHubUrl(url: string) {
  if (!url) return null;
  
  // Clean URL: remove trailing slashes and common artifacts
  const cleanUrl = url.trim().replace(/\/$/, "");
  
  // Standard Regex for owner/repo extraction
  const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
    };
  }
  
  return null;
}

export async function getRepoStats(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      name: data.full_name,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      issues: data.open_issues_count || 0,
      description: data.description || "",
      lastUpdate: data.updated_at,
      license: data.license?.spdx_id || data.license?.name || "",
      topics: data.topics || [],
      language: data.language || "",
    };
  } catch (error: unknown) {
    console.error(`Error fetching repo stats for ${owner}/${repo}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

/**
 * Fetches the latest published (non-prerelease, non-draft) release and its
 * downloadable assets. Null-tolerant: repos with no releases return null
 * rather than throwing (GitHub responds 404).
 */
export async function getLatestRelease(
  owner: string,
  repo: string,
): Promise<{ version: string; assets: ReleaseAsset[] } | null> {
  try {
    const { data } = await octokit.rest.repos.getLatestRelease({ owner, repo });
    return {
      version: data.tag_name || "",
      assets: (data.assets || []).map((a) => ({
        name: a.name,
        browser_download_url: a.browser_download_url,
        size: a.size,
      })),
    };
  } catch {
    // 404 simply means the repo has no releases — not an error worth surfacing.
    return null;
  }
}

/**
 * Fetches the README content for a repository.
 */
export async function getRepoReadme(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: "raw",
      },
    });
    return data as unknown as string;
  } catch (error: unknown) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error instanceof Error ? error.message : error);
    return "";
  }
}

/**
 * Auto-detects platforms and tool types based on repository metadata.
 */
export async function detectCategories(owner: string, repo: string, description: string) {
  const readme = await getRepoReadme(owner, repo);
  const stats = await getRepoStats(owner, repo);
  
  const content = (readme + " " + description + " " + (stats?.topics?.join(" ") || "")).toLowerCase();
  
  const platforms: string[] = [];
  const toolTypes: string[] = [];

  // Platform detection
  if (content.includes("windows") || content.includes(".exe") || content.includes("powershell")) platforms.push("Windows");
  if (content.includes("android") || content.includes(".apk") || content.includes("kotlin")) platforms.push("Android");
  if (content.includes("macos") || content.includes("dmg") || content.includes("swift")) platforms.push("macOS");
  if (content.includes("linux") || content.includes("ubuntu") || content.includes("debian")) platforms.push("Linux");
  if (content.includes("ios") || content.includes("iphone") || content.includes("ipad")) platforms.push("iOS");
  
  // Tool Type detection
  if (content.includes("mcp") || content.includes("model context protocol")) toolTypes.push("MCP Server");
  if (content.includes("extension") || content.includes("addon") || content.includes("plugin")) toolTypes.push("Extension");
  if (content.includes("api") || content.includes("rest") || content.includes("graphql")) toolTypes.push("API");
  if (content.includes("library") || content.includes("framework") || content.includes("sdk")) toolTypes.push("Library");
  if (content.includes("cli") || content.includes("terminal") || content.includes("command line")) toolTypes.push("CLI Tool");
  if (content.includes("agent") || content.includes("autonomous") || content.includes("workflow")) toolTypes.push("AI Agent");

  return {
    platforms: platforms.length > 0 ? platforms : ["Agnostic"],
    toolTypes: toolTypes.length > 0 ? toolTypes : ["Other"],
  };
}
