import React from 'react';
import Link from 'next/link';

const SideNavBar = () => {
  const categories = [
    { name: 'All Tools', icon: 'grid_view', href: '/' },
    { name: 'Web App', icon: 'language', href: '/category/web' },
    { name: 'MCP Servers', icon: 'terminal', href: '/category/mcp' },
    { name: 'Android', icon: 'android', href: '/category/android' },
    { name: 'Desktop', icon: 'desktop_windows', href: '/category/desktop' },
  ];

  const workTypes = [
    { name: 'Utilities', icon: 'construction', href: '/type/utilities' },
    { name: 'Productivity', icon: 'bolt', href: '/type/productivity' },
    { name: 'Development', icon: 'code', href: '/type/development' },
    { name: 'AI', icon: 'psychology', href: '/type/ai' },
  ];

  return (
    <aside className="h-full border-r border-white/5 w-64 hidden md:block bg-background sticky top-16">
      <div className="flex flex-col gap-1 py-8">
        <div className="px-6 mb-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-outline">Categories</span>
        </div>
        {categories.map((cat: any) => (
          <Link
            key={cat.name}
            href={cat.href}
            className={`px-6 py-3 flex items-center gap-3 transition-all ${
              cat.name === 'All Tools'
                ? 'bg-primary/10 text-primary border-r-2 border-primary font-semibold'
                : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined">{cat.icon}</span>
            <span className="text-sm">{cat.name}</span>
          </Link>
        ))}

        <div className="px-6 mt-10 mb-4">
          <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-outline">Work</span>
        </div>
        {workTypes.map((type: any) => (
          <Link
            key={type.name}
            href={type.href}
            className="text-on-surface-variant hover:bg-white/5 hover:text-white px-6 py-3 flex items-center gap-3 transition-all"
          >
            <span className="material-symbols-outlined">{type.icon}</span>
            <span className="text-sm">{type.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default SideNavBar;
