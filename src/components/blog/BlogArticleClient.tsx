'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/blog/PortableTextComponents';
import { urlForImage } from '@/sanity/image';

interface BlogArticleClientProps {
  post: any;
}

// Estimate reading time from the Portable Text body (~200 wpm), counting prose,
// code and terminal blocks so long code samples still bump the estimate.
type BodyBlock = {
  _type?: string;
  children?: { text?: string }[];
  code?: string;
  command?: string;
  output?: string;
};
function estimateReadTime(body: BodyBlock[]): string {
  if (!Array.isArray(body)) return '1 min read';
  let words = 0;
  for (const block of body) {
    if (block._type === 'block' && Array.isArray(block.children)) {
      for (const child of block.children) {
        if (typeof child.text === 'string') {
          words += child.text.trim().split(/\s+/).filter(Boolean).length;
        }
      }
    } else if (block._type === 'code' && typeof block.code === 'string') {
      words += block.code.split(/\s+/).filter(Boolean).length;
    } else if (block._type === 'terminal') {
      words += `${block.command || ''} ${block.output || ''}`
        .split(/\s+/)
        .filter(Boolean).length;
    }
  }
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function BlogArticleClient({ post }: BlogArticleClientProps) {
  const readTime = estimateReadTime(post.body);
  const [activeSection, setActiveSection] = useState<string>('intro');

  useEffect(() => {
    // Generate section IDs based on h2 headings for TOC if we wanted to
    // For now we just mock a single intro section or if there are headers
    const sectionIds = ['intro'];
    const headers = document.querySelectorAll('h2');
    headers.forEach((h, i) => {
      const id = `section-${i}`;
      h.id = id;
      sectionIds.push(id);
    });

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
  }, [post]);

  const headings = post.body?.filter((block: any) => block._type === 'block' && block.style === 'h2') || [];

  return (
    <main className="flex-grow pt-24 pb-32 md:pt-32 px-gutter max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-gutter relative">
      {/* Sticky Table of Contents (Desktop) */}
      <aside className="hidden md:block w-64 shrink-0 relative">
        <div className="sticky top-32 flex flex-col gap-3">
          <div className="glass-panel rounded-xl px-5 py-3 border border-outline-variant/20 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary glow-text">Contents</span>
            <span className="material-symbols-outlined text-[16px] text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
          </div>

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

          {headings.map((heading: any, i: number) => {
            const id = `section-${i}`;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={`no-underline block transition-all duration-300 p-4 rounded-xl border ${activeSection === id
                  ? 'neon-active-box'
                  : 'glass-panel border-outline-variant/15 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:scale-[1.01] hover:translate-x-0.5'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium tracking-wide">
                    {heading.children?.[0]?.text || `Section ${i + 1}`}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </aside>

      {/* Blog Article */}
      <article className="flex-grow max-w-3xl mx-auto w-full space-y-stack-lg z-10">
        <div className="mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors font-semibold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Tech Insights
          </Link>
        </div>

        <header className="space-y-stack-md mb-margin-page">
          <div className="flex items-center gap-2 text-primary font-label-sm text-label-sm">
            <span className="bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
              {post.category?.title || 'Article'}
            </span>
            <span className="text-on-surface-variant">• {readTime}</span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight font-extrabold tracking-tight mt-2">
            {post.title}
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed mt-2 font-medium">
            {post.excerpt}
          </p>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/25"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-6 border-t border-outline-variant/20 mt-stack-md">
            <div className="w-11 h-11 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/30 shrink-0">
              {post.author?.image ? (
                <img
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                  src={urlForImage(post.author.image)?.url() || ''}
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {post.author?.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface font-bold">{post.author?.name || 'Anonymous'}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-normal">{post.author?.role || 'Contributor'}</p>
            </div>
            <div className="ml-auto text-xs text-on-surface-variant font-mono">
              Published: {new Date(post.publishedAt || post._createdAt).toLocaleDateString()}
            </div>
          </div>
        </header>

        {post.mainImage && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-outline-variant/20 mb-stack-lg shadow-2xl">
            <img
              alt={post.title}
              className="w-full h-full object-cover"
              src={urlForImage(post.mainImage)?.url() || ''}
            />
            <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
          </div>
        )}

        <section className="space-y-4 leading-relaxed text-on-surface-variant text-[15px] md:text-[16px] scroll-mt-28" id="intro">
          {post.body ? (
            <PortableText value={post.body} components={portableTextComponents} />
          ) : (
            <p>No content available.</p>
          )}
        </section>

      </article>
    </main>
  );
}
