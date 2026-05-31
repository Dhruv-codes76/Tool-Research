'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface ArticleSection {
  title: string;
  description: string;
  code?: string;
  lang?: string;
}

interface BlogPostData {
  id: string;
  category: string;
  tag: string;
  readTime: string;
  date: string;
  title: string;
  description: string;
  author: Author;
  coverImage: string;
  introduction: string;
  sections: {
    setup: ArticleSection;
    config: ArticleSection;
  };
  tip: string;
  conclusion: string;
}

const blogPostDataMap: Record<string, BlogPostData> = {
  hero: {
    id: 'hero',
    category: 'Deep Dives',
    tag: 'Configuration',
    readTime: '12 min read',
    date: '2026-05-26',
    title: "Architecting the Perfect Neovim Configuration for 2024",
    description: "A comprehensive guide to building a blazing fast, utterly minimal, and highly extensible development environment using Lua. We break down the absolute essentials and ditch the bloat.",
    author: {
      name: "Elias Thorne",
      role: "Senior Systems Architect",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=1200&q=80",
    introduction: "Implementing a custom text editor workspace is no longer about just loading extensions; it's a core workflow architecture decision. In this guide, we'll walk through a structured, dependency-free approach to building Neovim from scratch using pure Lua configs. We focus on a modular architecture, ensuring that your editing workspace remains blazing fast and completely custom to your keymaps.",
    sections: {
      setup: {
        title: "Step 1: The Init.lua Foundation",
        description: "The first step is establishing a clean entrypoint. Instead of throwing everything in a single massive file, we structure our configuration modularly, loading runtime preferences immediately upon boot.",
        code: `-- ~/.config/nvim/init.lua
vim.g.mapleader = " "          -- Set Space as Leader key
vim.opt.number = true            -- Enable absolute line numbers
vim.opt.relativenumber = true    -- Enable relative line numbers
vim.opt.tabstop = 4              -- Number of spaces tabs count for
vim.opt.shiftwidth = 4           -- Size of an indent
vim.opt.expandtab = true         -- Use spaces instead of tabs
vim.opt.termguicolors = true     -- Enable 24-bit RGB colors`,
        lang: 'lua'
      },
      config: {
        title: "Step 2: Package Orchestration with Lazy.nvim",
        description: "Instead of relying on heavy pre-packaged systems, we configure Lazy.nvim to download, build, and load external components asynchronously, maintaining a total load time of under 20ms.",
        code: `-- ~/.config/nvim/lua/config/lazy.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
  spec = {
    { "nvim-treesitter/nvim-treesitter", build = ":TSUpdate" },
    { "nvim-telescope/telescope.nvim", dependencies = { "nvim-lua/plenary.nvim" } }
  }
})`,
        lang: 'lua'
      }
    },
    tip: "Use leader-key maps to build custom search triggers. Mapping <leader>ff to telescope's find_files search immediately unlocks lightning-fast navigation across multi-thousand-line source trees without leaving the keyboard home row.",
    conclusion: "By transitioning from generic IDE wrappers to a structured, lua-first Neovim architecture, you gain absolute control over your editing latency and environment dependencies. Your editor is now a native system component tailored exactly to your fingers."
  },
  'node-1': {
    id: 'node-1',
    category: 'Deep Dives',
    tag: 'Workflows',
    readTime: '18 min read',
    date: '2026-05-25',
    title: "Mastering the Art of Dotfiles Management with GNU Stow",
    description: "Stop losing your configurations. A detailed methodology for tracking, versioning, and deploying your entire system setup across multiple machines with zero friction.",
    author: {
      name: "Elias Thorne",
      role: "Senior Systems Architect",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFt60Mss7aNhdRPWBH585NeXnRdudcdntsHlb4Xwbq3sGyVVwq78FhVPEiuysNTCNJqB9A2M_e1tOe7X5Q18GivfPUtwF83YBTjnJcjh-Vs_eQfQHrNszR5UbPIDyX5QIQVs-XoOI6o-vZbgl0BfMHgrcYA7yXm89jvXQzNIcP6bTxvfNQcmVuv6mKoi4zXS8YeKuFugzern7eXc-VQfxpUz1qBfiOP-Sd8-yq2ul7ISv1ARSLQzGagw-qT6VBkK6OynUacNxJvYQ",
    introduction: "System configurations are organic; they grow, mutate, and break. Keeping your setups versioned in a centralized git repository is standard practice, but linking them into their native directories is where most developers falter. GNU Stow is a powerful, dependency-free symlink manager that maps files from a single repository into user environments effortlessly.",
    sections: {
      setup: {
        title: "Step 1: Organizing the Stow Directory",
        description: "Before creating links, configure your repository structure. GNU Stow assumes that directories within your dotfiles repository correspond directly to the relative structure of your user's home folder.",
        code: `# Navigate to your user's home and prepare dotfiles folder
mkdir -p ~/dotfiles/nvim/.config/nvim
mkdir -p ~/dotfiles/tmux

# Move your local configurations into these designated packages
mv ~/.config/nvim/init.lua ~/dotfiles/nvim/.config/nvim/
mv ~/.tmux.conf ~/dotfiles/tmux/`,
        lang: 'bash'
      },
      config: {
        title: "Step 2: Deploying with Stow symlinks",
        description: "Once your packages are structured, call Stow from the root of your dotfiles repository. Stow dynamically generates target symlinks into parent folders seamlessly.",
        code: `# Change directories into your central dotfiles hub
cd ~/dotfiles

# Stow dynamically creates corresponding symlinks inside ~/
stow nvim
stow tmux

# Verify the symlinks in the system
ls -la ~/.config/nvim/init.lua
# Output: ...init.lua -> ../../dotfiles/nvim/.config/nvim/init.lua`,
        lang: 'bash'
      }
    },
    tip: "Always execute Stow with the --dry-run (-n) and verbose (-v) flags before completing a deployment. This ensures you catch existing manual config conflicts before they cause any silent configuration loss.",
    conclusion: "Using Stow guarantees a clean, portable configuration setup that scales effortlessly. Bootstrapping a fresh operating system install is simplified into cloning your repository and executing stow, restoring your entire personal command suite in seconds."
  },
  'node-2': {
    id: 'node-2',
    category: 'Tool Reviews',
    tag: 'Hardware',
    readTime: '9 min read',
    date: '2026-05-23',
    title: "The Ultimate Developer Keyboard: Ergonomic & Ortholinear Efficiency",
    description: "Reviewing the latest ultra-minimal 40% ortholinear mechanical keyboards for peak coding ergonomics and keymap optimization.",
    author: {
      name: "Sarah Jenkins",
      role: "Ergonomic Workflow Specialist",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4di3ZDzJx_z5kvUYVkGz2cCB1ZG-QN9VvUqoN6doZSLLXSuWN3-m_TChKbZP6H9-f6fe_Mc21WoewbgjonXAKroQVet-CweyW7cxI_QxI7ea0Ifwol42ww5KjCYHUeuAIQFF5IYhl7650Ci6BfxJdTO1ukiDRCdGc4wKZulwbuzs5arW6falkCwcWNJmRPjIdmFiTDCoAwjH9rveGodyhXAVn_ajRC2NZgb1P785FUcGQW6eQjRTVPBtPXaRfnVT9_SP_R8C9xmA",
    introduction: "Standard computer keyboards are designed around a staggered typewriter layout from the 19th century, forcing fingers to stretch diagonally and causing continuous micro-strain. In this review, we examine the massive advantages of moving to modern 40% ortholinear mechanical keyboards where keys form perfect vertical grids and specialized layers minimize finger displacement.",
    sections: {
      setup: {
        title: "Step 1: Adapting to the Ortholinear Grid",
        description: "Ortholinear grids align keys in straight vertical columns. Fingers travel straight forward or straight back, reducing horizontal deviations and preventing repetitive strain injury (RSI).",
        code: `-- Staggered QWERTY layout (Standard typewriter)
Q  W  E  R  T  Y
  A  S  D  F  G  H
    Z  X  C  V  B

-- Ortholinear Grid (Linear column travel)
[Q][W][E][R][T][Y][U][I][O][P]
[A][S][D][F][G][H][J][K][L][;]
[Z][X][C][V][B][N][M][,][.][/]`,
        lang: 'text'
      },
      config: {
        title: "Step 2: Optimizing Layers with QMK Configs",
        description: "A 40% keyboard lacks separate number, function, and arrow rows. Instead, these characters are accessed by holding dynamic layer-modifier keys under your thumbs, eliminating hand movement.",
        code: `// QMK keymap.json custom symbol and utility layers
"layers": [
  // Layer 0: Default alpha keys, thumbs act as Space and Layer keys
  ["KC_TAB", "KC_Q", "KC_W", "KC_E", "KC_R", "KC_T", "KC_Y", "KC_U", "KC_I", "KC_O", "KC_P", "MO(1)"],
  
  // Layer 1: Symbols and numbers mapped to the home row
  ["KC_TRNS", "KC_1", "KC_2", "KC_3", "KC_4", "KC_5", "KC_LPRN", "KC_RPRN", "KC_MINS", "KC_EQL", "KC_BSLS", "KC_TRNS"],
  
  // Layer 2: Arrow navigations and terminal command keys
  ["KC_TRNS", "KC_LEFT", "KC_DOWN", "KC_UP", "KC_RGHT", "KC_PIPE", "KC_AMPR", "KC_ASTR", "KC_COLN", "KC_QUES", "KC_TRNS", "KC_TRNS"]
]`,
        lang: 'json'
      }
    },
    tip: "Move spacebar, backspace, delete, escape, and layer activation modifiers directly to your thumb clusters. Your thumbs are your strongest fingers; utilizing them for structural modifiers relieves stress from weaker pinky fingers.",
    conclusion: "Moving to an ergonomic split ortholinear mechanical keyboard has a steep 2-3 week learning curve, but the drastic drop in typing pain and visual desktop bloat makes it an indispensable asset for developers."
  },
  'node-3': {
    id: 'node-3',
    category: 'Tutorials',
    tag: 'Workflows',
    readTime: '8 min read',
    date: '2026-05-20',
    title: "Tmux Workspaces: Scripting Your Core Terminal Environments",
    description: "Scripting and automating your terminal sessions to spin up complex development environments instantaneously using Tmuxinator.",
    author: {
      name: "Sarah Jenkins",
      role: "Terminal Workflow Specialist",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1200&q=80",
    introduction: "In modern software development, you are rarely just writing code. You are launching local servers, tailing real-time database logs, and executing terminal utility tasks simultaneously. Running multiple shell tabs manually is an operational mess. Tmuxinator resolves this by letting you define declarative YAML workspaces that boot your complete layout in a single line.",
    sections: {
      setup: {
        title: "Step 1: Customizing tmux.conf Bindings",
        description: "Before automating sessions, configure Tmux to be highly fluid. Re-mapping the default prefix key and enabling mouse interactions makes terminal pane management incredibly smooth.",
        code: `# ~/.tmux.conf
unbind C-b
set-option -g prefix C-a         # Bind Prefix to Ctrl-a for easier reach
bind-key C-a send-prefix

set -g mouse on                  # Enable clicking to switch and resize panes
set -g base-index 1              # Align window numbers with physical keyboard
set -g pane-base-index 1
set -g default-terminal "screen-256color"`,
        lang: 'tmux'
      },
      config: {
        title: "Step 2: Automating workspaces with Tmuxinator",
        description: "Tmuxinator compiles simple YAML definitions into custom tmux commands. You define exactly how many panes, layouts, and pre-loaded commands you need for your specific projects.",
        code: `# ~/.config/tmuxinator/tools-section.yml
name: tools-section
root: ~/projects/tools-section

windows:
  - editor:
      layout: main-vertical
      panes:
        - nvim .                # Main editor pane
        - git status            # Sidebar pane
  - runtime:
      layout: even-horizontal
      panes:
        - npm run dev           # Next.js dev server
        - npx prisma studio     # Database GUI console`,
        lang: 'yaml'
      }
    },
    tip: "Use the terminal command alias alias mux=\"tmuxinator\" to launch workspaces instantly. Executing mux start tools-section boots your full terminal editor and server in under a second.",
    conclusion: "By scripting tmux workspaces, you transform the tedious process of spinning up local servers and editor tabs into a robust, crash-resilient command center that remains active even during terminal crashes."
  }
};

// Fallback blog post data (Mastering Dark Mode in Tailwind CSS: A Comprehensive Guide)
const fallbackPost: BlogPostData = {
  id: 'fallback',
  category: 'Tutorials',
  tag: 'Styles & Layouts',
  readTime: '10 min read',
  date: '2026-05-15',
  title: "Mastering Dark Mode in Tailwind CSS: A Comprehensive Guide",
  description: "Learn how to implement a robust, system-aware dark mode using Tailwind CSS and semantic design tokens.",
  author: {
    name: "Alex Mercer",
    role: "Senior Frontend Engineer",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlq36IwEywzE4aiCctCIPEFBJwTec-Jm3SRfVwBgQxEtR_4V4yTkjuZSDdVPxlMphX2uAEZ4rIwZfBzOlKYMTHdHrdEXs_QWyU5a5e5CXfzDGh4s3xqdeZu135AVgekd1KbtEhaG7usckyRyfX0MwikCL041omXorPBFwcv4hGCUWpiVMQfZK3fdXBM3g0YiOph7yjhWEAMLHhqH3SBHuLAdpPH0sFJulCAp_w5vwvH6l63mnllgBFZYTymXvIFyG18qC21Bo5Kwk"
  },
  coverImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoR4OJt7eGHDN9cOD3rLaR9mJNwvVH1jpk4qKKQYXRWPPdasM3UTPOLFVVE-NpXfb-JWZjvuDqmgYtwBP9L4TVdHDh5wGdyTSUXkhTjyMP23g6LBZ0Wq3y3MmTTSNucvmyEesl8hwZ-O9fateCyv_R7NmTZ-VsMZ9DjuwUBPuAgVg6C7NdgMdp1TlrIWbFItE8kLXo1QvXCztIg2Iqf_DhFoaq3DX7xtg76YCEl6LvsvtXh4dGga947IfiT9ebonZnVLm04a2x_e0",
  introduction: "Implementing dark mode is no longer an optional feature; it's a core expectation for modern web applications. In this guide, we'll walk through a structured, clean approach to adding dark mode using Tailwind CSS. We will focus on using a semantic color palette, ensuring that your application remains scalable and maintainable as your design system or theme options evolve.",
  sections: {
    setup: {
      title: "Step 1: Tailwind Configuration",
      description: "The first step is telling Tailwind to rely on a CSS class for toggling dark mode manually rather than relying exclusively on system media queries. This enables granular user-override options.",
      code: `// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',       // Enables class-based toggling
  theme: {
    extend: {
      colors: {
        // Define your custom semantic tokens here
      }
    }
  }
};
export default config;`,
      lang: 'typescript'
    },
    config: {
      title: "Step 2: Setting Semantic Tokens",
      description: "Instead of hardcoding generic utilities like bg-gray-900 or bg-white in your HTML structures, configure semantic design tokens like surface-container-lowest to abstract the themes cleanly.",
      code: `/* globals.css */
@theme {
  --color-background: #831599ff;
  --color-surface-container: #201f1f;
  --color-primary: #1b13b5ff;
  --color-on-surface: #e5e2e1;
}

/* These variables auto-swap values when the parent class is set to .dark */
.dark {
  --color-background: #77085fff;
  --color-surface-container: #121212;
} `,
      lang: 'css'
    }
  },
  tip: "Establish a clear naming convention for your color tokens before writing any UI code. A typical design system hierarchy includes background, surface roles, primary accent, and status indicators.",
  conclusion: "By leveraging Tailwind's class-based dark mode and semantic color configuration, you create a robust foundation for a premium, dual-theme user interface that loads instantly and keeps configurations organized."
};

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Safe param extraction for Next.js 16 Client Component
  const resolvedParams = params && 'then' in params ? use(params) : params;
  const postId = resolvedParams?.id || '';

  const post = blogPostDataMap[postId] || fallbackPost;

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('intro');

  useEffect(() => {
    const sectionIds = ['intro', 'step1', 'step2', 'conclusion'];

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -55% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <main className="flex-grow pt-24 pb-32 md:pt-32 px-gutter max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-gutter relative">
      {/* Sticky Table of Contents (Desktop) */}
      <aside className="hidden md:block w-64 shrink-0 relative">
        <div className="sticky top-32 flex flex-col gap-3">
          {/* Header Title inside its own sleek glass container */}
          <div className="glass-panel rounded-xl px-5 py-3 border border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary glow-text">Contents</span>
            <span className="material-symbols-outlined text-[16px] text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
          </div>

          {/* Introduction Box */}
          <a
            href="#intro"
            className={`no-underline block transition-all duration-300 p-4 rounded-xl border ${activeSection === 'intro'
              ? 'neon-active-box'
              : 'glass-panel border-outline-variant/15 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:scale-[1.01] hover:translate-x-0.5'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium tracking-wide">Introduction</span>
            </div>
          </a>

          {/* Step 1 Box */}
          <a
            href="#step1"
            className={`no-underline block transition-all duration-300 p-4 rounded-xl border ${activeSection === 'step1'
              ? 'neon-active-box'
              : 'glass-panel border-outline-variant/15 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:scale-[1.01] hover:translate-x-0.5'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium tracking-wide">{post.sections.setup.title.split(':')[0] || 'Step 1'}</span>
            </div>
          </a>

          {/* Step 2 Box */}
          <a
            href="#step2"
            className={`no-underline block transition-all duration-300 p-4 rounded-xl border ${activeSection === 'step2'
              ? 'neon-active-box'
              : 'glass-panel border-outline-variant/15 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:scale-[1.01] hover:translate-x-0.5'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium tracking-wide">{post.sections.config.title.split(':')[0] || 'Step 2'}</span>
            </div>
          </a>

          {/* Conclusion Box */}
          <a
            href="#conclusion"
            className={`no-underline block transition-all duration-300 p-4 rounded-xl border ${activeSection === 'conclusion'
              ? 'neon-active-box'
              : 'glass-panel border-outline-variant/15 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:scale-[1.01] hover:translate-x-0.5'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-xs font-medium tracking-wide">Conclusion</span>
            </div>
          </a>
        </div>
      </aside>

      {/* Blog Article */}
      <article className="flex-grow max-w-3xl mx-auto w-full space-y-stack-lg z-10">

        {/* Breadcrumbs / Back button */}
        <div className="mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors font-semibold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Tech Insights
          </Link>
        </div>

        {/* Header Metadata */}
        <header className="space-y-stack-md mb-margin-page">
          <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm">
            <span className="bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
              {post.category}
            </span>
            <span className="text-on-surface-variant">• {post.readTime}</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight font-extrabold tracking-tight mt-2">
            {post.title}
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mt-2 font-medium">
            {post.description}
          </p>

          <div className="flex items-center gap-4 pt-6 border-t border-outline-variant/20 mt-stack-md">
            <div className="w-11 h-11 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 shrink-0">
              <img
                alt={post.author.name}
                className="w-full h-full object-cover"
                src={post.author.avatar}
              />
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-bold">{post.author.name}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">{post.author.role}</p>
            </div>
            <div className="ml-auto text-xs text-on-surface-variant font-mono">
              Published: {post.date}
            </div>
          </div>
        </header>

        {/* Article Cover Image */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-outline-variant/20 mb-stack-lg shadow-2xl">
          <img
            alt={post.title}
            className="w-full h-full object-cover"
            src={post.coverImage}
          />
          <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
        </div>

        {/* Introduction Section */}
        <section className="space-y-4 leading-relaxed text-on-surface-variant text-[15px] md:text-[16px] scroll-mt-28" id="intro">
          <p>{post.introduction}</p>
        </section>

        {/* Setup Section */}
        <section className="space-y-4 scroll-mt-28" id="step1">
          <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mt-stack-lg mb-stack-md font-bold tracking-tight">
            {post.sections.setup.title}
          </h2>
          <p className="text-on-surface-variant leading-relaxed text-[15px] md:text-[16px]">
            {post.sections.setup.description}
          </p>

          {post.sections.setup.code && (
            <div className="relative group mt-4 mb-6">
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={() => copyToClipboard(post.sections.setup.code || '', 'setup')}
                  className="bg-surface-container-high/90 backdrop-blur text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-md border border-outline-variant/30 flex items-center gap-1 font-label-sm text-label-sm cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedSection === 'setup' ? 'check' : 'content_copy'}
                  </span>
                  {copiedSection === 'setup' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0A0A0A] p-6 rounded-xl border border-outline-variant/30 overflow-x-auto">
                <code className="font-code-snippet text-code-snippet text-[#c7c4d8] text-[13px] md:text-[14px]">
                  {post.sections.setup.code}
                </code>
              </pre>
            </div>
          )}
        </section>

        {/* Configuration Section */}
        <section className="space-y-4 scroll-mt-28" id="step2">
          <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mt-stack-lg mb-stack-md font-bold tracking-tight">
            {post.sections.config.title}
          </h2>
          <p className="text-on-surface-variant leading-relaxed text-[15px] md:text-[16px]">
            {post.sections.config.description}
          </p>

          {post.sections.config.code && (
            <div className="relative group mt-4 mb-6">
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={() => copyToClipboard(post.sections.config.code || '', 'config')}
                  className="bg-surface-container-high/90 backdrop-blur text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-md border border-outline-variant/30 flex items-center gap-1 font-label-sm text-label-sm cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copiedSection === 'config' ? 'check' : 'content_copy'}
                  </span>
                  {copiedSection === 'config' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0A0A0A] p-6 rounded-xl border border-outline-variant/30 overflow-x-auto">
                <code className="font-code-snippet text-code-snippet text-[#c7c4d8] text-[13px] md:text-[14px]">
                  {post.sections.config.code}
                </code>
              </pre>
            </div>
          )}

          {/* Pro Tip Box */}
          <div className="glass-panel p-6 rounded-xl my-8 flex gap-4 items-start shadow-lg">
            <span
              className="material-symbols-outlined text-primary mt-1 text-2xl shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lightbulb
            </span>
            <div>
              <h4 className="font-label-sm text-label-sm text-on-surface mb-2 font-bold uppercase tracking-wider">
                Pro Tip
              </h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {post.tip}
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion Section */}
        <section className="space-y-4 scroll-mt-28" id="conclusion">
          <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mt-stack-lg mb-stack-md font-bold tracking-tight">
            Conclusion
          </h2>
          <p className="text-on-surface-variant leading-relaxed text-[15px] md:text-[16px]">
            {post.conclusion}
          </p>
        </section>

      </article>
    </main>
  );
}
