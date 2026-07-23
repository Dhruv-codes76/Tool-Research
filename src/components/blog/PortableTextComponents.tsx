'use client';

import React, { useState } from 'react';
import { PortableTextComponents } from '@portabletext/react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { urlForImage } from '@/sanity/image';

// Register only the languages we expose in the Studio dropdown (keeps the
// client bundle lean vs. the full Prism build).
[
  ['bash', bash],
  ['typescript', typescript],
  ['tsx', tsx],
  ['javascript', javascript],
  ['jsx', jsx],
  ['json', json],
  ['python', python],
  ['go', go],
  ['rust', rust],
  ['yaml', yaml],
  ['sql', sql],
  ['markup', markup],
  ['css', css],
  ['docker', docker],
  ['markdown', markdown],
].forEach(([name, lang]) =>
  SyntaxHighlighter.registerLanguage(name as string, lang as never),
);

// Small copy-to-clipboard button with a transient "Copied" state.
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="bg-surface-container-high/90 backdrop-blur text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-md border border-outline-variant/30 flex items-center gap-1 font-label-sm text-label-sm cursor-pointer shadow-md"
    >
      <span className="material-symbols-outlined text-[16px]">
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// Turn a YouTube / Vimeo URL into its privacy-friendly embed URL.
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

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
    // @sanity/code-input: { code, language, filename }
    code: ({ value }) => {
      if (!value?.code) return null;
      const language = value.language || 'text';
      return (
        <div className="relative group mt-4 mb-6">
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <CopyButton text={value.code} />
          </div>
          {value.filename && (
            <div className="bg-surface-container px-4 py-2 border-b border-outline-variant/30 text-xs font-mono text-on-surface-variant rounded-t-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary/70">description</span>
              {value.filename}
            </div>
          )}
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              background: '#0A0A0A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: value.filename ? '0 0 0.75rem 0.75rem' : '0.75rem',
              borderTop: value.filename ? 'none' : undefined,
              fontSize: '13.5px',
            }}
            codeTagProps={{ style: { fontFamily: 'var(--font-mono), monospace' } }}
          >
            {value.code}
          </SyntaxHighlighter>
        </div>
      );
    },
    // Legacy custom code block (kept so any old content still renders).
    codeBlock: ({ value }) => {
      if (!value?.code) return null;
      return (
        <div className="relative group mt-4 mb-6">
          <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <CopyButton text={value.code} />
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
    // Shell commands styled as a terminal window.
    terminal: ({ value }) => {
      if (!value?.command) return null;
      return (
        <div className="my-8 rounded-xl overflow-hidden border border-outline-variant/25 shadow-2xl bg-[#0A0A0A]">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container border-b border-outline-variant/25">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
              {value.title || 'bash'}
            </span>
          </div>
          <div className="p-5 overflow-x-auto font-mono text-[13px] md:text-[14px] leading-relaxed">
            {value.command.split('\n').map((line: string, i: number) => (
              <div key={i} className="flex gap-2">
                <span className="text-primary select-none shrink-0">$</span>
                <span className="text-[#e6e3f0] whitespace-pre">{line}</span>
              </div>
            ))}
            {value.output && (
              <pre className="mt-2 text-on-surface-variant whitespace-pre-wrap">{value.output}</pre>
            )}
          </div>
        </div>
      );
    },
    // @sanity/table: { rows: [{ _key, cells: string[] }] } — first row = header.
    table: ({ value }) => {
      const rows: { _key: string; cells: string[] }[] = value?.rows || [];
      if (!rows.length) return null;
      const [head, ...body] = rows;
      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-outline-variant/25">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="bg-surface-container">
                {head.cells.map((cell, i) => (
                  <th
                    key={i}
                    className="text-left font-bold text-on-surface px-4 py-3 border-b border-outline-variant/30"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row) => (
                <tr key={row._key} className="even:bg-surface-container-lowest/40">
                  {row.cells.map((cell, i) => (
                    <td
                      key={i}
                      className="px-4 py-3 border-b border-outline-variant/15 text-on-surface-variant align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    // Responsive YouTube / Vimeo embed.
    videoEmbed: ({ value }) => {
      const embed = getEmbedUrl(value?.url || '');
      if (!embed) return null;
      return (
        <figure className="my-8">
          <div className="relative w-full rounded-xl overflow-hidden border border-outline-variant/20 shadow-2xl" style={{ aspectRatio: '16 / 9' }}>
            <iframe
              src={embed}
              title={value.caption || 'Embedded video'}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-xs text-on-surface-variant">{value.caption}</figcaption>
          )}
        </figure>
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
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="font-mono text-[0.85em] bg-surface-container-high text-primary px-1.5 py-0.5 rounded border border-outline-variant/25">
        {children}
      </code>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 my-4 space-y-2 text-on-surface-variant marker:text-primary/60">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2 text-on-surface-variant marker:text-primary/60">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  },
  block: {
    h1: ({ children }) => <h1 className="font-headline-md text-3xl md:text-4xl text-on-surface mt-10 mb-6 font-bold tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="font-headline-md text-2xl md:text-3xl text-on-surface mt-10 mb-4 font-bold tracking-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="font-headline-md text-xl md:text-2xl text-on-surface mt-8 mb-4 font-bold tracking-tight">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/50 pl-5 my-6 italic text-on-surface-variant">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="text-on-surface-variant leading-relaxed text-[15px] md:text-[16px] mb-4">{children}</p>,
  },
};
