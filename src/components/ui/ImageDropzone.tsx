'use client';

import React, { useRef, useState } from 'react';
import { uploadToolImage } from '@/lib/supabase';

type Aspect = 'square' | 'video' | 'portrait';

const ASPECT: Record<Aspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[9/16]',
};

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  /** Aspect ratio of the drop target / preview. */
  aspect?: Aspect;
  /** Prefix used when naming the uploaded file in storage. */
  filePrefix?: string;
  /** Small corner index badge (used for gallery slots). */
  badge?: string | number;
  /** Object-fit for the preview — logos want 'contain', screenshots 'cover'. */
  fit?: 'contain' | 'cover';
  /** Center hint text (dropzone empty state). */
  hint?: string;
}

/**
 * Premium image input: drag-and-drop or browse, uploads to Supabase Storage,
 * shows a preview with a clear button. Motion stays on transform/opacity only.
 */
export function ImageDropzone({
  value,
  onChange,
  aspect = 'video',
  filePrefix = 'img',
  badge,
  fit = 'cover',
  hint = 'Drop or browse',
}: ImageDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadToolImage(file, `${filePrefix}-${Date.now()}-${file.name}`);
      onChange(url);
    } catch {
      setError('Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const aspectClass = ASPECT[aspect];

  if (value) {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest ${aspectClass}`}
        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Uploaded preview"
          className={`h-full w-full ${fit === 'contain' ? 'object-contain p-4' : 'object-cover'} transition-transform duration-500 group-hover:scale-[1.03]`}
        />
        {badge !== undefined && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur-sm">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Remove image"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 hover:bg-error/80 group-hover:opacity-100"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void upload(f); }}
        className={`relative flex ${aspectClass} cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <span
          className={`material-symbols-outlined text-[30px] transition-transform duration-200 ${isDragging ? 'text-primary scale-110' : 'text-primary/55'}`}
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {isUploading ? 'progress_activity' : 'add_photo_alternate'}
        </span>
        <p className="px-3 text-[11px] leading-tight text-on-surface-variant">
          {isUploading ? 'Uploading…' : (
            <>
              {hint.split('browse')[0]}
              {hint.includes('browse') && <span className="text-primary underline underline-offset-2">browse</span>}
            </>
          )}
        </p>
        {badge !== undefined && (
          <span className="absolute bottom-2 left-2 text-[10px] font-medium text-on-surface-variant/50">{badge}</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }}
          disabled={isUploading}
        />
      </label>
      {error && <p className="text-[11px] text-error">{error}</p>}
    </div>
  );
}
