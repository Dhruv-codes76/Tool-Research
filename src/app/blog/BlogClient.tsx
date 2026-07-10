'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { urlForImage } from '@/sanity/image';

export interface SanityPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  mainImage: any;
  authorName: string;
  authorImage: any;
  categories: string[];
}

export default function BlogClient({ posts }: { posts: SanityPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Nodes');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Extract unique categories from posts
  const allCategories = ['All Nodes', ...Array.from(new Set(posts.flatMap(p => p.categories || [])))];

  // Filter nodes according to selected category
  const filteredNodes = selectedCategory === 'All Nodes'
    ? posts
    : posts.filter(post => post.categories?.includes(selectedCategory));

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
          {allCategories.map((cat: any) => {
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
          {filteredNodes.map((node: any) => (
            <Link href={`/blog/${node.slug?.current}`} key={node._id} className="block no-underline">
              <article
                className="liquid-glass overflow-hidden flex flex-col h-full group cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Card Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-outline-variant/20 bg-surface-container">
                  {node.mainImage ? (
                    <img
                      alt={node.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                      src={urlForImage(node.mainImage)?.url() || ''}
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                </div>

                {/* Card Main Body */}
                <div className="p-6 sm:p-7 flex flex-col flex-grow">
                  {/* Meta Text */}
                  <div className="text-[11px] font-bold text-primary tracking-wider uppercase mb-3 flex items-center gap-1.5 flex-wrap">
                    <span>{new Date(node.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>By {node.authorName || 'Unknown'}</span>
                  </div>

                  {/* Prominent Bold Title */}
                  <h2 className="text-[19px] font-bold text-on-surface leading-snug mb-3 group-hover:text-primary transition-colors duration-300">
                    {node.title}
                  </h2>

                  {/* Snippet Description */}
                  <p className="text-[13px] text-on-surface-variant leading-relaxed mb-6 line-clamp-3">
                    {node.excerpt || node.title}
                  </p>

                  {/* Footer Link */}
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
        
        {filteredNodes.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            No insights found for this category.
          </div>
        )}
      </div>
    </main>
  );
}
