import React from 'react';
import { PortableTextComponents } from '@portabletext/react';
import { urlForImage } from '@/sanity/image';

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // We can't easily show a copied state here without making it a client component
  // For simplicity, we'll just copy it.
};

export const portableTextComponents: PortableTextComponents = {
  types: {
    contentImage: ({ value }) => {
      if (!value?.image) return null;
      return (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-outline-variant/20 my-8 shadow-2xl">
          <img
            src={urlForImage(value.image)?.url() || ''}
            alt={value.alt || 'Blog image'}
            className="w-full h-full object-cover"
          />
          {value.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center text-xs text-white">
              {value.caption}
            </div>
          )}
        </div>
      );
    },
    codeBlock: ({ value }) => {
      if (!value?.code) return null;
      return (
        <div className="relative group mt-4 mb-6">
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={() => copyToClipboard(value.code)}
              className="bg-surface-container-high/90 backdrop-blur text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-md border border-outline-variant/30 flex items-center gap-1 font-label-sm text-label-sm cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy
            </button>
          </div>
          {value.filename && (
            <div className="bg-surface-container px-4 py-2 border-b border-outline-variant/30 text-xs font-mono text-on-surface-variant rounded-t-xl">
              {value.filename}
            </div>
          )}
          <pre className={`bg-[#0A0A0A] p-6 border border-outline-variant/30 overflow-x-auto ${value.filename ? 'rounded-b-xl border-t-0' : 'rounded-xl'}`}>
            <code className="font-code-snippet text-code-snippet text-[#c7c4d8] text-[13px] md:text-[14px]">
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
    callout: ({ value }) => {
      if (!value?.text) return null;
      let icon = 'lightbulb';
      let title = 'Pro Tip';
      
      if (value.type === 'info') { icon = 'info'; title = 'Info'; }
      if (value.type === 'warning') { icon = 'warning'; title = 'Warning'; }
      if (value.type === 'danger') { icon = 'error'; title = 'Danger'; }

      return (
        <div className="glass-panel p-6 rounded-xl my-8 flex gap-4 items-start shadow-lg">
          <span
            className="material-symbols-outlined text-primary mt-1 text-2xl shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <div>
            <h4 className="font-label-sm text-label-sm text-on-surface mb-2 font-bold uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {value.text}
            </p>
          </div>
        </div>
      );
    }
  },
  block: {
    h1: ({ children }) => <h1 className="font-headline-md text-3xl md:text-4xl text-on-surface mt-10 mb-6 font-bold tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mt-10 mb-4 font-bold tracking-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mt-8 mb-4 font-bold tracking-tight">{children}</h3>,
    normal: ({ children }) => <p className="text-on-surface-variant leading-relaxed text-[15px] md:text-[16px] mb-4">{children}</p>,
  },
};
