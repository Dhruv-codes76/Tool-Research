'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ToolCard } from '@/components/ui/ToolCard';
import { EditSubmissionModal } from '@/components/dashboard/EditSubmissionModal';

type Submission = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  rejectionReason: string | null;
  edits: string[];
  // Editable-while-pending fields.
  repoUrl: string;
  galleryImages: string;
  galleryLayout: string;
  toolTypes: string[];
  platforms: string[];
};

type SavedCard = {
  id: string;
  slug: string;
  name: string;
  stars: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
  logoUrl?: string | null;
};

const STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  ACTIVE:   { label: 'Published',      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', icon: 'check_circle' },
  PENDING:  { label: 'Pending review', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/25',       icon: 'schedule' },
  REJECTED: { label: 'Not accepted',   cls: 'bg-rose-500/15 text-rose-300 border-rose-500/25',          icon: 'cancel' },
  DRAFT:    { label: 'Draft',          cls: 'bg-white/10 text-on-surface-variant border-white/15',       icon: 'edit_note' },
};

const EDIT_LABELS: Record<string, string> = {
  name: 'name', description: 'description', categories: 'categories', image: 'image',
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

export function DashboardTabs({ submissions, saved, initialTab = 'submissions', availablePlatforms = [], availableToolTypes = [] }: { submissions: Submission[]; saved: SavedCard[]; initialTab?: 'submissions' | 'saved'; availablePlatforms?: string[]; availableToolTypes?: string[] }) {
  const [tab, setTab] = useState<'submissions' | 'saved'>(initialTab);

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-full border border-outline-variant/25 bg-surface-container-lowest p-1 w-fit">
        <TabBtn active={tab === 'submissions'} onClick={() => setTab('submissions')} icon="upload_file" label="My submissions" count={submissions.length} />
        <TabBtn active={tab === 'saved'} onClick={() => setTab('saved')} icon="favorite" label="Saved" count={saved.length} />
      </div>

      {tab === 'submissions' ? (
        submissions.length === 0 ? (
          <EmptyState
            icon="upload_file"
            title="No submissions yet"
            body="Know a great open-source AI tool? Submit it and track its review here."
            cta={{ href: '/tools/submit', label: 'Submit a tool' }}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {submissions.map((s) => (
              <SubmissionRow key={s.id} s={s} availablePlatforms={availablePlatforms} availableToolTypes={availableToolTypes} />
            ))}
          </div>
        )
      ) : saved.length === 0 ? (
        <EmptyState
          icon="favorite"
          title="Nothing saved yet"
          body="Tap the heart on any tool to keep it here for later."
          cta={{ href: '/tools', label: 'Browse tools' }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((t) => (
            <ToolCard key={t.id} {...t} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionRow({ s, availablePlatforms, availableToolTypes }: { s: Submission; availablePlatforms: string[]; availableToolTypes: string[] }) {
  const status = STATUS[s.status] ?? STATUS.DRAFT;
  const isPublished = s.status === 'ACTIVE';
  const isPending = s.status === 'PENDING';
  const [editing, setEditing] = useState(false);

  const inner = (
    <div className="flex items-start gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/60 p-4 transition-colors hover:border-outline-variant/40 sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-container">
        {s.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant/50">deployed_code</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-on-surface">{s.name}</h3>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.cls}`}>
            <span className="material-symbols-outlined text-[12px]">{status.icon}</span>
            {status.label}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-on-surface-variant">{s.description || 'No description'}</p>

        {/* "Refined by our team" — field-level diff from the submission snapshot */}
        {isPublished && s.edits.length > 0 && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary/90">
            <span className="material-symbols-outlined text-[13px]">auto_fix_high</span>
            Our editors refined the {s.edits.map((e) => EDIT_LABELS[e] ?? e).join(', ')} before publishing.
          </p>
        )}
        {s.status === 'REJECTED' && s.rejectionReason && (
          <p className="mt-1.5 text-[11px] text-rose-300/90">Reason: {s.rejectionReason}</p>
        )}
        {s.status === 'PENDING' && (
          <p className="mt-1.5 text-[11px] text-on-surface-variant/70">A human reviews every submission — you&rsquo;ll get an email when it&rsquo;s decided.</p>
        )}

        <p className="mt-1 text-[10px] text-on-surface-variant/50">Submitted {fmtDate(s.createdAt)}</p>
      </div>

      {isPending && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 self-center inline-flex items-center gap-1.5 rounded-full border border-outline-variant/40 px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[15px]">edit</span>
          Edit
        </button>
      )}
      {isPublished && (
        <span className="material-symbols-outlined shrink-0 self-center text-on-surface-variant/40">chevron_right</span>
      )}
    </div>
  );

  // Published tools link to the live page; others aren't public yet.
  if (isPublished) {
    return <Link href={`/tools/${s.slug}`} className="block">{inner}</Link>;
  }

  return (
    <div>
      {inner}
      {editing && (
        <EditSubmissionModal
          submission={{
            id: s.id,
            name: s.name,
            repoUrl: s.repoUrl,
            description: s.description,
            heroImageUrl: s.logoUrl,
            galleryImages: s.galleryImages,
            galleryLayout: s.galleryLayout,
            toolTypes: s.toolTypes,
            platforms: s.platforms,
          }}
          availablePlatforms={availablePlatforms}
          availableToolTypes={availableToolTypes}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: active && icon === 'favorite' ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      {label}
      <span className={`rounded-full px-1.5 text-[11px] ${active ? 'bg-black/15' : 'bg-white/10'}`}>{count}</span>
    </button>
  );
}

function EmptyState({ icon, title, body, cta }: { icon: string; title: string; body: string; cta: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/40 px-6 py-16 text-center">
      <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">{icon}</span>
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      <p className="max-w-sm text-sm text-on-surface-variant">{body}</p>
      <Link href={cta.href} className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition-transform hover:scale-[1.03]">
        {cta.label}
      </Link>
    </div>
  );
}
