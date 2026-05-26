'use client';

import React, { useState, useTransition } from 'react';
import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryChip } from '@/components/ui/CategoryChip';

interface ToolItem {
  id: string;
  name: string;
  stars: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
}

interface ToolsListClientProps {
  initialTools: ToolItem[];
  allPlatforms: string[];
  allTypes: string[];
}

export const ToolsListClient: React.FC<ToolsListClientProps> = ({ 
  initialTools,
  allPlatforms,
  allTypes 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list starting with 'All', then showing platforms and tool types
  const categories = ['All', ...allTypes, ...allPlatforms];

  // Filter tools dynamically on the client for instant, reactive responsiveness
  const filteredTools = initialTools.filter(tool => {
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      tool.tags.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <div className="w-full lg:max-w-md">
          <SearchBar 
            placeholder="Search tools dynamically..." 
            onSearch={(query) => setSearchQuery(query)}
          />
        </div>
        <div className="flex flex-wrap gap-2 max-w-full lg:max-w-xl">
          {categories.map((cat) => (
            <CategoryChip 
              key={cat} 
              label={cat} 
              isActive={selectedCategory === cat} 
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl bg-surface-container border border-outline-variant/30">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">search_off</span>
          <h3 className="font-headline-sm text-on-surface mb-2">No matching tools found</h3>
          <p className="text-on-surface-variant font-body-base max-w-md mx-auto">
            Try adjusting your search query or selecting a different category to discover open-source excellence.
          </p>
        </div>
      )}

      {/* Pagination (Only show if multiple pages would exist, for premium UI placeholder compatibility) */}
      {filteredTools.length > 6 && (
        <div className="mt-20 flex justify-center">
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button 
                key={page} 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-label-sm border ${
                  page === 1 
                    ? 'bg-primary-container text-on-primary-container border-primary' 
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="w-10 h-10 rounded-full flex items-center justify-center font-label-sm border border-outline-variant/30 text-on-surface-variant hover:border-primary">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
