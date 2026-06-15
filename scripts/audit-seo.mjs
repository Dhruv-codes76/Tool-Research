#!/usr/bin/env node
/**
 * Standalone SEO auditor — crawls a running server and asserts the on-page SEO
 * invariants this project relies on. Ported from the MVP's validate-seo-output
 * doctrine, adapted to Next.js (checks rendered HTML over HTTP rather than a
 * dist/ folder, so it never touches the build or the database).
 *
 * Usage:
 *   npm run dev                       # in one terminal
 *   node scripts/audit-seo.mjs        # in another (defaults to localhost:3000)
 *   AUDIT_BASE_URL=https://aitoolresearch.com node scripts/audit-seo.mjs
 *   node scripts/audit-seo.mjs /tools/some-id /blog/some-slug   # extra paths
 *
 * Exit code 1 if any page FAILs, so it can gate CI later.
 */

const BASE = (process.env.AUDIT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

// Static public surface. Pass extra dynamic paths (tool/blog) as CLI args.
const DEFAULT_PATHS = ["/", "/tools", "/blog", "/about", "/privacy", "/terms"];
const PATHS = [...DEFAULT_PATHS, ...process.argv.slice(2)];

// Thresholds (warnings, not failures, where the MVP doctrine treats them softly).
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;
const BODY_MIN_CHARS = 100; // soft-404 guard

const titleRe = /<title[^>]*>([\s\S]*?)<\/title>/i;
const canonicalRe = /<link[^>]+rel=["']canonical["'][^>]*>/gi;
const descRe = /<meta[^>]+name=["']description["'][^>]*>/i;
const contentAttrRe = /content=["']([\s\S]*?)["']/i;
const ldJsonRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

function visibleTextLength(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return body.length;
}

async function audit(path) {
  const url = `${BASE}${path}`;
  const fails = [];
  const warns = [];
  let title = null;
  let description = null;

  let res;
  try {
    res = await fetch(url, { redirect: "manual" });
  } catch (e) {
    return { path, fails: [`unreachable: ${e.message}`], warns, title, description };
  }

  if (res.status >= 400) fails.push(`HTTP ${res.status}`);
  const html = await res.text();

  // Title
  const titleMatch = html.match(titleRe);
  title = titleMatch ? decode(titleMatch[1]) : null;
  if (!title) fails.push("missing <title>");
  else if (title.length > TITLE_MAX) warns.push(`title ${title.length} chars (>${TITLE_MAX})`);

  // Meta description
  const descTag = html.match(descRe)?.[0];
  const descContent = descTag?.match(contentAttrRe)?.[1];
  description = descContent ? decode(descContent) : null;
  if (!description) fails.push("missing meta description");
  else {
    if (description.length < DESC_MIN) warns.push(`description ${description.length} chars (<${DESC_MIN})`);
    if (description.length > DESC_MAX) warns.push(`description ${description.length} chars (>${DESC_MAX})`);
  }

  // Canonical — exactly one
  const canonicalCount = (html.match(canonicalRe) || []).length;
  if (canonicalCount !== 1) fails.push(`expected 1 canonical, found ${canonicalCount}`);

  // JSON-LD — at least one, all must parse
  const ldBlocks = [...html.matchAll(ldJsonRe)].map((m) => m[1]);
  if (ldBlocks.length === 0) {
    warns.push("no JSON-LD structured data");
  } else {
    ldBlocks.forEach((block, i) => {
      try {
        JSON.parse(block);
      } catch {
        fails.push(`JSON-LD block #${i + 1} is invalid JSON`);
      }
    });
  }

  // Soft-404 guard
  const bodyLen = visibleTextLength(html);
  if (bodyLen < BODY_MIN_CHARS) fails.push(`only ${bodyLen} chars of visible text (<${BODY_MIN_CHARS})`);

  return { path, fails, warns, title, description };
}

async function main() {
  console.log(`\nSEO audit against ${BASE}\n${"=".repeat(50)}`);
  const results = [];
  for (const path of PATHS) {
    results.push(await audit(path));
  }

  // Cross-page duplicate detection (warning).
  const titleMap = new Map();
  const descMap = new Map();
  for (const r of results) {
    if (r.title) titleMap.set(r.title, [...(titleMap.get(r.title) || []), r.path]);
    if (r.description) descMap.set(r.description, [...(descMap.get(r.description) || []), r.path]);
  }

  let failCount = 0;
  let warnCount = 0;
  for (const r of results) {
    const dupTitle = r.title && titleMap.get(r.title).length > 1;
    const dupDesc = r.description && descMap.get(r.description).length > 1;
    const extraWarns = [...r.warns];
    if (dupTitle) extraWarns.push(`duplicate title shared with ${titleMap.get(r.title).filter((p) => p !== r.path).join(", ")}`);
    if (dupDesc) extraWarns.push(`duplicate description shared with ${descMap.get(r.description).filter((p) => p !== r.path).join(", ")}`);

    const status = r.fails.length ? "FAIL" : extraWarns.length ? "WARN" : "OK  ";
    console.log(`\n[${status}] ${r.path}`);
    if (r.title) console.log(`       title: ${r.title} (${r.title.length})`);
    r.fails.forEach((f) => console.log(`       ✗ ${f}`));
    extraWarns.forEach((w) => console.log(`       ! ${w}`));

    failCount += r.fails.length;
    warnCount += extraWarns.length;
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`${results.length} pages · ${failCount} failures · ${warnCount} warnings\n`);
  if (failCount > 0) process.exit(1);
}

main();
