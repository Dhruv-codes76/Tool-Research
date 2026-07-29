import React from 'react';

/**
 * The "this isn't open source" disclosure, shown directly under the hero on a
 * PROPRIETARY tool page — the first thing read after the title, never buried.
 *
 * Voice per BRAND.md: state what's true, don't hype, don't apologise. The
 * directory's promise is human curation, and a closed-source tool earning a
 * place here is exactly that judgement being made out loud.
 *
 * Amber/bronze rather than the indigo brand accent: across the card grid, the
 * hero and this block, that one colour shift is the signal readers learn to
 * recognise. Non-uniform radius and no motion, per DESIGN.md §6.
 */
export function SourceNotice({ toolName, note }: { toolName: string; note?: string | null }) {
  return (
    <aside
      className="relative overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border border-[#D9A441]/25 p-5 md:p-6"
      style={{
        background: 'rgba(28, 32, 37, 0.4)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Accent hairline down the leading edge — the recognition cue. */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-[#D9A441]/60" />

      <div className="flex gap-4">
        <span
          aria-hidden
          className="material-symbols-outlined shrink-0 text-[22px] text-[#D9A441]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          info
        </span>
        <div className="min-w-0">
          <h2 className="font-headline-md text-base md:text-lg text-on-surface">
            Not open source — listed because it&rsquo;s worth it.
          </h2>
          <p className="mt-2 font-body-base text-sm leading-relaxed text-on-surface-variant">
            We index open-source tools by default. {toolName}{' '}is proprietary, but it is widely used, highly popular, and exceptionally useful. It earns a place in our dictionary based on its quality, utility, and widespread adoption.
          </p>
        </div>
      </div>
    </aside>
  );
}
