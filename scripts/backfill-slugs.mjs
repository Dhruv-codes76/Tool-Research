#!/usr/bin/env node
/**
 * One-off maintenance: backfill a unique slug for any Tool row that is missing
 * one. Slug is the sole public URL identifier, so a NULL/empty slug leaves a
 * tool with no canonical, un-indexable URL. Run this once against a database
 * that predates the slug-only setup, before/after deploying the unique-slug
 * migration.
 *
 * Safe to re-run: it only touches rows whose slug is null or empty, and it
 * dedupes against every existing slug.
 *
 *   # against local
 *   node scripts/backfill-slugs.mjs
 *   # against production (be deliberate)
 *   DATABASE_URL="$PROD_DIRECT_URL" node scripts/backfill-slugs.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const slugify = (input) =>
  String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function main() {
  let all;
  try {
    all = await prisma.tool.findMany({ select: { id: true, name: true, slug: true } });
  } catch (err) {
    // Fresh database: the Tool table/columns don't exist yet (migrate deploy
    // will create them next). Nothing to backfill — exit cleanly so we don't
    // block the build. P2021 = table missing, P2022 = column missing.
    if (err?.code === "P2021" || err?.code === "P2022") {
      console.log("↷ Tool table not present yet — skipping slug backfill.");
      return;
    }
    throw err;
  }

  const taken = new Set(all.map((t) => t.slug).filter(Boolean));
  const missing = all.filter((t) => !t.slug);

  if (missing.length === 0) {
    console.log(`✔ All ${all.length} tools already have a slug. Nothing to do.`);
    return;
  }

  console.log(`Found ${missing.length} tool(s) without a slug. Backfilling…`);
  for (const tool of missing) {
    const root = slugify(tool.name) || `tool-${tool.id.slice(0, 8)}`;
    let candidate = root;
    let n = 1;
    while (taken.has(candidate)) {
      n += 1;
      candidate = `${root}-${n}`;
    }
    taken.add(candidate);
    await prisma.tool.update({ where: { id: tool.id }, data: { slug: candidate } });
    console.log(`  • ${tool.name} → /tools/${candidate}`);
  }
  console.log(`✔ Backfilled ${missing.length} slug(s).`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
