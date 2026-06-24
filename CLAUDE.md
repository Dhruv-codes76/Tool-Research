# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**AI Tool Research (aitoolresearch.com)** — a manually curated "Tool Dictionary" for open-source AI tools on GitHub. Curators paste a GitHub URL, the app pulls live repo metadata, and an editor publishes a premium tool detail page. The philosophy is human curation over automated scraping.

The repo root holds design docs only ([DESIGN.md](DESIGN.md), [gemini.md](gemini.md), `.gemini/`, a static `index.html` prototype). **All application code lives in [tools-section/](tools-section/)**, which is its own git repository. Run every command and treat that directory as the project root.

## Commands

Run from `tools-section/`:

```bash
npm run dev        # Next.js dev server (Turbopack) on :3000
npm run build      # prisma generate -> node scripts/deploy-db.js (migrate deploy + seed) -> next build
npm run start      # serve production build
npm run lint       # eslint (flat config, eslint.config.mjs)

npx prisma generate        # regenerate client after schema.prisma edits
npx prisma migrate dev     # create + apply a migration locally
npx prisma db seed         # run prisma/seed.ts (via ts-node)
```

There is **no test runner configured** — `package.json` has no `test` script and no test files exist. Do not claim tests pass; verify changes with `npm run build` and `npm run lint`.

`npm run build` runs migrations and seeds against `DATABASE_URL` before building (see [scripts/deploy-db.js](tools-section/scripts/deploy-db.js)). It is the production/Vercel build path and will hit a live DB — avoid running it casually for a quick type check.

## Architecture

**Stack:** Next.js 16.2 (App Router, React 19.2), Prisma 7.8, Tailwind CSS v4, Supabase (Auth + Storage), Sanity (blog CMS), Octokit (GitHub), Resend (email), Zod, react-hook-form, framer-motion.

**Next.js 16 caveat** ([tools-section/AGENTS.md](tools-section/AGENTS.md)): this is *not* the Next.js in your training data. Route `params` are now Promises (`await params`). Consult `node_modules/next/dist/docs/` before writing framework code and heed deprecation notices.

### Data layer
- **Database is PostgreSQL**, despite DESIGN.md/README mentioning SQLite. [schema.prisma](tools-section/prisma/schema.prisma) uses `provider = "postgresql"` and [lib/prisma.ts](tools-section/src/lib/prisma.ts) uses the `@prisma/adapter-pg` driver adapter against `DATABASE_URL`. Treat the SQLite references in the docs as outdated.
- The Prisma client is a global singleton (dev) to avoid connection exhaustion.
- Core model `Tool` belongs to a `User` and has many-to-many `Platform[]` and `ToolType[]`. Several fields are **JSON-encoded strings**, not relations: `galleryImages`, `features` (both default `"[]"`). `installCommand` is a serialized JSON map of OS → command. Parse/stringify these at the boundary.
- `status` is a string lifecycle: `ACTIVE` / `DRAFT` / `DELETED`. Deletes are **soft** (`deleteTool` sets `status: 'DELETED'`); queries filter on `status: 'ACTIVE'`.
- Deploy uses two URLs: `DIRECT_URL` (migrations) and pooled `DATABASE_URL` (queries/seed).

### Server actions are the API
Business logic lives in `"use server"` modules, not REST controllers:
- [actions/adminActions.ts](tools-section/src/app/actions/adminActions.ts) — admin CRUD for tools + categories, and `fetchGitHubMetadata()` which calls the GitHub REST API directly (repo, releases/latest, readme) to prefill the tool form.
- [actions/toolActions.ts](tools-section/src/app/actions/toolActions.ts) — public `getTools` (search/platform/toolType filters), `getToolByUrl`, `submitTool`, `refreshToolStats`. Uses [lib/github.ts](tools-section/src/lib/github.ts) (Octokit) for stats and keyword-based `detectCategories`.
- The only HTTP route, [api/tools/route.ts](tools-section/src/app/api/tools/route.ts), is a thin wrapper over `getTools`.

After any tool/category mutation, call `revalidatePath` for the affected public + admin paths (`/`, `/tools`, `/tools/{id}`, `/admin/tools`, `/admin/categories`) — follow the existing pattern in the action you touch.

**Category delete guard:** never hard-delete a `Platform`/`ToolType` with linked tools — the actions count `_count.tools` and throw. Preserve this when editing category logic.

### Many-to-many writes
Tool create/update uses `connectOrCreate` on platform/toolType **names**. Updates clear relations first with `set: []` then reconnect. Categories are created on the fly if a name doesn't exist.

### Auth & RBAC
Identity is Supabase Auth; **authorization is the Prisma `User` row** (`role` USER/ADMIN, `isPrimaryAdmin`, `status` INVITED/ACTIVE/DISABLED). [lib/auth-guard.ts](tools-section/src/lib/auth-guard.ts) is the single gate:
- `getCurrentAdmin()` — `getUser()` (verifies the JWT — never `getSession()` server-side) + checks `role === ADMIN && status === ACTIVE`; returns null. Use in pages/layouts (then `redirect`).
- `requireAdmin()` — throws "Forbidden"; use in Server Actions.
- `requirePrimaryAdmin()` — throws unless the caller is the primary admin; gates destructive admin-management actions.

[middleware.ts](tools-section/src/middleware.ts) gates `/admin/*` at the edge (authenticated check + Supabase token refresh); the role check stays in Node (layout + actions) because Edge can't reach Prisma.

**Admin lifecycle** ([actions/adminManagementActions.ts](tools-section/src/app/actions/adminManagementActions.ts) + `/admin/manage-admins`): any admin can `inviteAdmin` (Supabase `inviteUserByEmail` → `/accept-invite` sets password → `acceptInvite` flips to ACTIVE). Only the primary admin can `removeAdmin` (demote to USER — never delete, `Tool.userId` FK) or `revokeInvite`. The primary admin is seeded via self-invite ([prisma/seed.ts](tools-section/prisma/seed.ts), idempotent) and can never be removed. New env: `PRIMARY_ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL` (see `.env.example`). Invite/reset emails need Supabase custom SMTP → Resend configured in the dashboard.

### Routing notes
- `/tool/[id]` is a legacy redirect to `/tools/[id]` (the real detail page). Add new tool pages under `/tools/`.
- Tool detail and many components apply inline glassmorphism style objects rather than CSS classes — match that local convention when editing those files.

### Integrations
- **Supabase Storage** ([lib/supabase.ts](tools-section/src/lib/supabase.ts)): `uploadToolImage()` writes to the `tool-screenshots` bucket and returns a public URL. The client falls back to placeholder values when env vars are missing so the app doesn't crash unconfigured — don't remove that guard.
- **Sanity** ([sanity/](tools-section/src/sanity/)): powers `/blog` only (GROQ queries in `sanity/queries.ts`, default project `avrir21x`). Tools are in Postgres, blog posts are in Sanity — keep them separate.
- **GitHub**: two paths exist — Octokit in `lib/github.ts` (public actions) and raw `fetch` in `adminActions.fetchGitHubMetadata`. Both read `GITHUB_PERSONAL_ACCESS_TOKEN`.

## Project conventions (from `.gemini/`)
The root `.gemini/` directory is the authoritative rules/skills source (mirrors what this file summarizes). Before non-trivial work consult:
- UI/frontend → `.gemini/rules/web/design-quality.md` + `coding-style.md`
- auth/forms → `.gemini/skills/security-review/`
- schema/migrations → `.gemini/skills/database-migrations/`
- tool pages/SEO → `.gemini/skills/seo/`

**Design rules** (DESIGN.md §6): dark "luxury" palette with Material 3 tokens, `.glass-panel` glassmorphism, semantic HTML5, animate only compositor-friendly props (`transform`/`opacity`/`clip-path`). Banned: uniform border-radius, gray-on-white defaults, generic card grids without scale hierarchy. Vanilla CSS is preferred for premium surfaces.

**Commits:** conventional commits (`feat:`, `fix:`, `chore:`). Commit/push only when asked. The git repo is `tools-section/`, not the workspace root.
