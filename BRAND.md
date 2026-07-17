# Brand & Editorial Guidelines v1.0 — AI Tool Research

> **Scope.** This file owns **voice, editorial conventions, messaging, and positioning.**
> For anything *visual* — the palette, glass panels, typography scale, motion, banned UI
> patterns — [`DESIGN.md`](DESIGN.md) §6 is **authoritative**. If the two ever disagree on a
> visual detail, `DESIGN.md` wins. This doc governs the *words*; `DESIGN.md` governs the *look*.

---

## Quick Reference

| Element | Value |
|---------|-------|
| Product name | **AI Tool Research** (never "AI Tools Research" / "AiToolResearch") |
| Domain | aitoolresearch.com |
| Category | A premium, **manually curated** "Tool Dictionary" for open-source AI tools on GitHub |
| One-liner | *Human-curated, high-signal discovery for the best open-source AI tools.* |
| Voice | Authoritative curator — precise, editorial, premium; never hype, never scraper-noise |
| Visual identity | Dark luxury / Material 3 / glassmorphism — see `DESIGN.md` §6 |

---

## 1. Brand Identity

**What it is.** A high-signal discovery platform where human editors curate the best open-source
AI tools on GitHub. Every tool page is a premium, hand-checked entry — a *dictionary*, not a feed.

**The core belief (our wedge).** *Human curation beats automated scraping.* Aggregators drown
users in low-signal noise; we publish fewer tools, verified and well-written. Every editorial and
product decision should reinforce that "curated > scraped" promise.

**Who it's for.**
| Audience | Who | What they want |
|----------|-----|----------------|
| **Primary readers** | Engineers, creators, researchers evaluating AI tooling | Trustworthy signal fast — is this tool real, maintained, worth adopting? |
| **Curators / editors** | The internal humans who publish tools | Consistent structure and voice so every entry reads like one authoritative source |

> **Confirm:** Is the primary reader mainly **developers/engineers**, or a broader
> **creators/researchers** audience? Draft leans developer-first. It shifts how technical the copy gets.

---

## 2. Voice & Tone

**The voice:** an **authoritative curator** — the knowledgeable editor who has already vetted the
tool for you. Precise, confident, and economical. Editorial polish without marketing hype.

**Principles**
1. **High-signal, low-noise.** Every sentence earns its place. No filler, no "in today's fast-paced
   world" throat-clearing. If it doesn't help someone decide, cut it.
2. **Verified, not hyped.** State what the tool *does* and what's *true* (stars, license, maintenance
   status). Never inflate ("revolutionary," "game-changing," "the best ever"). Let the facts rank it.
3. **Respect the makers.** These are real open-source projects by real maintainers. Credit authors,
   describe accurately, never sneer at or overhype a project.
4. **Premium, not corporate.** Confident and refined — matches the dark-luxury UI. Not stiff, not
   startup-breathless, not emoji-spammy.

**Say / Avoid**
- Say: "curated," "verified," "maintained," "open-source," "high-signal," "well-documented," "actively developed."
- Avoid: "revolutionary," "game-changer," "must-have," "the ultimate," "AI-powered" as filler, and any
  claim you haven't confirmed from the repo (stars/forks/license/last-commit come from live metadata — use it).

---

## 3. Editorial Conventions (the practical part)

How the writing that lives in the DB and UI should read. These make tool entries consistent — the
same discipline `DESIGN.md` brings to components, applied to copy.

| Field | Length | Style |
|-------|--------|-------|
| **Tool name** | — | The project's real name, as the maintainers write it. Don't rebrand it. |
| **Short description** | ~1 sentence, ≤160 chars | What it *does*, in plain terms. Leads with the capability, not the category. "Runs LLMs locally on your machine." not "An AI tool for models." |
| **About text** (`aboutText`, markdown) | 2–4 short paragraphs | Curator's take: what it is, who it's for, what stands out, honest caveats. Editorial, not a README dump. |
| **Features** (the 3-feature JSON) | 3 items, ~3–6 words each | Concrete capabilities, parallel phrasing. Verbs or noun-phrases — pick one and stay consistent within the set. |
| **Meta description** (SEO) | ≤155 chars | See the `seo` skill. Benefit-first, includes the tool name, no keyword stuffing. |

**Rules of thumb**
- Write for someone deciding in 10 seconds whether to click through to the repo.
- Prefer specific nouns over adjectives ("MCP server for Postgres" > "powerful database tool").
- Never fabricate capabilities, benchmarks, or version numbers. If it's not confirmed, leave it out.
- Match the tool's own terminology (if maintainers say "agents," don't rename them "assistants").

---

## 4. Positioning & Messaging

### Positioning statement
> For engineers and builders drowning in AI-tool noise, **AI Tool Research** is a human-curated
> dictionary of the best open-source AI tools on GitHub — so every entry you read is verified,
> well-written, and worth your time, not scraped filler.

### Tagline (canonical one-liner)
> **Curated, not scraped.**

> **Confirm:** Preferred tagline? Alternatives: *"High-signal AI tool discovery."* ·
> *"The curated dictionary for open-source AI tools."* · *"Fewer tools. Better signal."*

### Value pillars
1. **Human-curated** — every tool vetted and written by an editor, not an algorithm.
2. **High-signal** — fewer, better entries; noise filtered out before you arrive.
3. **Live & honest** — real GitHub metadata (stars, forks, license, activity) on every page.
4. **Premium reading experience** — a design system built to make evaluation feel effortless.

### Competitive frame
> **Confirm this list.** Draft assumes the comparison set is aggregators like
> **There's An AI For That, Futurepedia, and Product Hunt's AI section.** Our wedge vs. them:
> *human curation + open-source focus + live repo signal*, instead of paid-listing volume.
> Correct the named competitors before using this in any public copy.

---

## 5. Naming & Usage

- **Product name:** always "AI Tool Research" — three words, title case. Never "AI Tools Research,"
  "AIToolResearch," or "aitoolresearch" in prose (the domain is lowercase; the brand is not).
- **Domain:** aitoolresearch.com.
- **Tone of the name in copy:** it's a *research* platform and a *dictionary* — lean on "curated,"
  "entry," "verified," "dictionary," not "listing" or "directory" (those read like the aggregators).

> **Confirm / provide:** Is there a **logo / wordmark** or an official **tagline/trademark** string?
> If so, point me to it and I'll add a Logo Usage section (clear-space, min-size, misuse) tied to the
> `DESIGN.md` palette.

---

## Related
- [`DESIGN.md`](DESIGN.md) — **authoritative** visual source of truth (palette, glass panels, typography, banned patterns). §6 is the design system.
- `.claude/skills/design-system/` — the operational visual skill (Material 3 tokens, glass surfaces, motion).
- `.claude/skills/seo/` — meta titles/descriptions and structured data; the editorial rules here feed it.
- `.claude/skills/curate-tool/` — the tool CRUD workflow where `aboutText` / `description` / `features` are written.
