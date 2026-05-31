'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Author {
  name: string;
  avatar: string;
}

interface BlogNode {
  id: string;
  category: string;
  title: string;
  description: string;
  author: Author;
  image: string;
  date: string;
  readTime: string;
  icon: string;
}

const blogNodes: BlogNode[] = [
  {
    id: 'hero',
    category: 'Deep Dives',
    title: "Architecting the Perfect Neovim Configuration for 2024",
    description: "A comprehensive guide to building a blazing fast, utterly minimal, and highly extensible development environment using Lua. We break down the absolute essentials and ditch the bloat.",
    author: {
      name: "Elias Thorne",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80",
    date: "2026-05-26",
    readTime: "12 min",
    icon: "star"
  },
  {
    id: 'node-1',
    category: 'Deep Dives',
    title: "Mastering the Art of Dotfiles Management with GNU Stow",
    description: "Stop losing your configurations. A detailed methodology for tracking, versioning, and deploying your entire system setup across multiple machines with zero friction.",
    author: {
      name: "Elias Thorne",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFt60Mss7aNhdRPWBH585NeXnRdudcdntsHlb4Xwbq3sGyVVwq78FhVPEiuysNTCNJqB9A2M_e1tOe7X5Q18GivfPUtwF83YBTjnJcjh-Vs_eQfQHrNszR5UbPIDyX5QIQVs-XoOI6o-vZbgl0BfMHgrcYA7yXm89jvXQzNIcP6bTxvfNQcmVuv6mKoi4zXS8YeKuFugzern7eXc-VQfxpUz1qBfiOP-Sd8-yq2ul7ISv1ARSLQzGagw-qT6VBkK6OynUacNxJvYQ",
    date: "2026-05-25",
    readTime: "18 min",
    icon: "account_tree"
  },
  {
    id: 'node-2',
    category: 'Tool Reviews',
    title: "The Ultimate Developer Keyboard: Ergonomic & Ortholinear Efficiency",
    description: "Reviewing the latest ultra-minimal 40% ortholinear mechanical keyboards for peak coding ergonomics and keymap optimization.",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4di3ZDzJx_z5kvUYVkGz2cCB1ZG-QN9VvUqoN6doZSLLXSuWN3-m_TChKbZP6H9-f6fe_Mc21WoewbgjonXAKroQVet-CweyW7cxI_QxI7ea0Ifwol42ww5KjCYHUeuAIQFF5IYhl7650Ci6BfxJdTO1ukiDRCdGc4wKZulwbuzs5arW6falkCwcWNJmRPjIdmFiTDCoAwjH9rveGodyhXAVn_ajRC2NZgb1P785FUcGQW6eQjRTVPBtPXaRfnVT9_SP_R8C9xmA",
    date: "2026-05-23",
    readTime: "9 min",
    icon: "keyboard"
  },
  {
    id: 'node-3',
    category: 'Tutorials',
    title: "Tmux Workspaces: Scripting Your Core Terminal Environments",
    description: "Scripting and automating your terminal sessions to spin up complex development environments instantaneously using Tmuxinator.",
    author: {
      name: "Sarah Jenkins",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBLYWLvC0nL2r-Udregl_oXHcy6k2g5eceUbpV2jreN-Jia0vykJIFvd82LTGqeiNuIlHpP8Halopy5R57lYtSYxkJDU5jqvPY2bNbq2hy0HPeWjA099qMc7q-0ACFNh_YPEXlq3ZuE5VhQ0ghYN5yG_FPn4HaQ-2mzMftn2nmHJTybphoF6sPLxy4q4L2xYqleKNM5dJcDPN2chmKl-s3FgQqNP5u2-X7JTWzLkfS3pSdrMOndE5zs5FGFYeHWuwcERat8AclwXZk"
    },
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
    date: "2026-05-20",
    readTime: "8 min",
    icon: "terminal"
  }
];

const categories = ['All Nodes', 'Tutorials', 'Deep Dives', 'Tool Reviews'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Nodes');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter nodes according to selected category
  const filteredNodes = selectedCategory === 'All Nodes'
    ? blogNodes
    : blogNodes.filter(node => node.category === selectedCategory);

  return (
    <main className="flex-grow pt-[100px] pb-margin-page px-gutter w-full relative min-h-screen">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-[120px]" />
      </div>

      {/* Header Banner */}
      <div className="relative z-10 max-w-container-max mx-auto text-center py-8 mb-6">
        <h1 className="text-display-lg font-display-lg text-on-surface tracking-tight mb-4">
          Tech <span className="text-primary glow-text">Insights</span>
        </h1>
        <p className="font-body-base text-on-surface-variant max-w-xl mx-auto">
          News, deep dives, and core configurations from the Tool Research development team.
        </p>
      </div>

      {/* Interactive Category Filter */}
      <div className="relative z-10 max-w-container-max mx-auto mb-10">
        <div className="flex justify-center gap-stack-sm flex-wrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-6 py-2 rounded-full font-label-sm text-label-sm liquid-glass transition-transform active:scale-95 duration-200 cursor-pointer ${
                  isActive
                    ? 'text-primary border-primary/50 shadow-[0_0_15px_rgba(195,192,255,0.3)] bg-primary-container/20'
                    : 'text-on-surface hover:text-primary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-in-a-Row Normal Grid Layout */}
      <div className="relative z-10 max-w-container-max mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNodes.map((node) => (
            <Link href={`/blog/${node.id}`} key={node.id} className="block no-underline">
              <article
                className="liquid-glass overflow-hidden flex flex-col h-full group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Card Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant/20 bg-surface-container">
                  <img
                    alt={node.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    src={node.image}
                  />
                  <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                </div>

                {/* Card Main Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow">
                  {/* Meta Text (PhishSkill styling: small text, inline, bold violet/primary) */}
                  <div className="text-[11px] font-bold text-primary tracking-wider uppercase mb-3 flex items-center gap-1.5 flex-wrap">
                    <span>{node.date}</span>
                    <span>•</span>
                    <span>{node.readTime} read</span>
                    <span>•</span>
                    <span>By {node.author.name}</span>
                  </div>

                  {/* Prominent Bold Title */}
                  <h2 className="text-[19px] font-bold text-on-surface leading-snug mb-3 group-hover:text-primary transition-colors duration-300">
                    {node.title}
                  </h2>

                  {/* Snippet Description */}
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                    {node.description}
                  </p>

                  {/* Footer Link (PhishSkill styling: bold violet, dynamic hover) */}
                  <div className="text-[12px] font-bold text-primary mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between group/link">
                    <span className="line-clamp-1 group-hover/link:underline">
                      Read: {node.title}
                    </span>
                    <span className="material-symbols-outlined text-[16px] transform group-hover/link:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="relative z-10 mt-12 flex justify-center pb-8">
        <button className="px-8 py-3 rounded-full border border-primary/30 text-primary font-label-sm text-label-sm liquid-glass hover:shadow-[0_0_20px_rgba(195,192,255,0.3)] transition-all duration-300 flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-[16px]">add_circle</span> Load More Nodes
        </button>
      </div>
    </main>
  );
}
