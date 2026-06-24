# AI Tool Research (aitoolresearch.com) - Project Architecture & Purpose

## Purpose
This project serves as a "Tool Dictionary" specifically for open-source tools hosted on GitHub. Its primary goal is to provide a centralized platform where users can discover, browse, and publish open-source AI tools.

## Key Features
1. **Tool Directory**: A searchable and filterable list of open-source tools.
2. **GitHub API Integration**: To fetch real-time data about tools (e.g., stars, forks, issues, recent commits) directly from GitHub.
3. **Authentication System**: A login system allowing users to authenticate, submit, and publish new tools to the directory.
4. **Manual Curation**: A responsible, high-quality selection process to add and publish top open-source tools, ensuring the directory remains premium and accurate.

## Global Rules & Constraints
- Focus on clean architecture and separation of concerns.
- Ensure security best practices, particularly for the authentication and publishing workflows.
- Prioritize high-quality, premium visual aesthetics and dynamic interactions (Vanilla CSS preferred).
- Avoid assumptions about requirements; ask clarifying questions when needed.

## Agent Guidelines (.gemini)
- **Project Context:** This is a manually curated, premium dictionary for open-source AI tools. Avoid building automated scrapers; focus on high-quality manual entry.
- **Style & Stack:** Prioritize Vanilla CSS for premium aesthetics as requested. Use Next.js App Router and Supabase.
- **Mandatory File Checks:**
  - **For UI/Frontend:** Must read `.gemini/rules/web/design-quality.md` and `coding-style.md` before creating components.
  - **For Auth & Submissions:** Must check `.gemini/skills/security-review` before modifying authentication or forms.
  - **For Database Changes:** Must consult `.gemini/skills/database-migrations` before updating Prisma schema or running migrations.
  - **For Tool Pages:** Must apply `.gemini/skills/seo` to ensure high search visibility for curated tools.
