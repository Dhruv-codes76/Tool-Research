"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTool, updateTool, fetchGitHubMetadata, ToolAdminFormData } from '@/app/actions/adminActions';
import { uploadToolImage } from '@/lib/supabase';
import { InstallSection } from '@/components/tools/InstallSection';
import {
  OS_OPTIONS,
  parseInstallCommands,
  parseDownloadAssets,
  type InstallCommand,
  type DownloadAsset,
} from '@/lib/install';

type Feature = { title: string; description: string; icon: string };

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/(^-|-$)+/g, '');
}

export function ToolForm({ initialData, availablePlatforms = [], availableToolTypes = [] }: { 
  initialData?: any;
  availablePlatforms?: string[];
  availableToolTypes?: string[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('windows');
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState<Record<number, boolean>>({});
  const [logoTab, setLogoTab] = useState<'upload' | 'link'>('upload');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState<Record<number, boolean>>({});
  const [galleryTab, setGalleryTab] = useState<'upload' | 'link'>('upload');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadLogoFile(file);
  };

  const handleLogoDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    await uploadLogoFile(file);
  };

  const uploadLogoFile = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      const fileName = `logo-${Date.now()}-${file.name}`;
      const url = await uploadToolImage(file, fileName);
      setFormData({...formData, heroImageUrl: url});
    } catch (err) {
      console.error("Logo upload failed", err);
      alert("Failed to upload logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadGalleryFile(file, idx);
  };

  const handleGalleryDrop = async (e: React.DragEvent<HTMLLabelElement>, idx: number) => {
    e.preventDefault();
    setIsDraggingGallery(prev => ({ ...prev, [idx]: false }));
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    await uploadGalleryFile(file, idx);
  };

  const uploadGalleryFile = async (file: File, idx: number) => {
    setUploadingGallery(prev => ({ ...prev, [idx]: true }));
    try {
      const fileName = `gallery-${idx}-${Date.now()}-${file.name}`;
      const url = await uploadToolImage(file, fileName);
      
      let images: string[] = [];
      try {
        images = JSON.parse(formData.galleryImages || '[]');
      } catch (e) {}
      
      const newImages = [...images];
      newImages[idx] = url;
      setFormData({...formData, galleryImages: JSON.stringify(newImages.filter(Boolean))});
    } catch (err) {
      console.error("Gallery upload failed", err);
      alert("Failed to upload gallery image.");
    } finally {
      setUploadingGallery(prev => ({ ...prev, [idx]: false }));
    }
  };



  // Parse initial features safely
  let initialFeatures: Feature[] = [];
  try {
    if (initialData?.features) {
      initialFeatures = JSON.parse(initialData.features);
    }
  } catch (e) {}
  
  // Ensure exactly 3 features with fixed icons
  const fixedIcons = ['bolt', 'lock', 'extension'];
  while (initialFeatures.length < 3) {
    initialFeatures.push({ title: '', description: '', icon: fixedIcons[initialFeatures.length] });
  }
  initialFeatures = initialFeatures.slice(0, 3);
  initialFeatures.forEach((feat, i) => { feat.icon = fixedIcons[i]; });

  const [features, setFeatures] = useState<Feature[]>(initialFeatures);

  // Install commands and download assets are edited as proper state arrays
  // (parsed once, serialized on submit) — the same pattern as `features`.
  const [commands, setCommands] = useState<InstallCommand[]>(
    parseInstallCommands(initialData?.installCommand)
  );
  const [assets, setAssets] = useState<DownloadAsset[]>(
    parseDownloadAssets(initialData?.downloadAssets)
  );

  const [formData, setFormData] = useState<ToolAdminFormData>({
    repoUrl: initialData?.repoUrl || '',
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    stars: initialData?.stars || 0,
    forks: initialData?.forks || 0,
    issues: initialData?.issues || 0,
    status: initialData?.status || 'ACTIVE',
    aboutText: initialData?.aboutText || '',
    metaDescription: initialData?.metaDescription || '',
    version: initialData?.version || '',
    license: initialData?.license || '',
    installCommand: initialData?.installCommand || '',
    heroImageUrl: initialData?.heroImageUrl || '',
    galleryImages: initialData?.galleryImages || '[]',
    galleryLayout: initialData?.galleryLayout || '16:9',
    features: initialData?.features || '[]',
    author: initialData?.author || '',
    authorUrl: initialData?.authorUrl || '',
    since: initialData?.since || '',
    websiteUrl: initialData?.websiteUrl || '',
    downloadUrl: initialData?.downloadUrl || '',
    downloadAssets: initialData?.downloadAssets || '[]',
    platforms: initialData?.platforms?.map((p: any) => p.name) || [],
    toolTypes: initialData?.toolTypes?.map((t: any) => t.name) || [],
  });

  const handleFetch = async () => {
    if (!formData.repoUrl) return;
    setIsFetching(true);
    
    try {
      const data = await fetchGitHubMetadata(formData.repoUrl);
      
      // Attempt to auto-map platforms if possible, based on topics or something
      // We can just add them if they match existing platforms (case-insensitive)
      const newPlatforms = new Set(formData.platforms);
      const newTypes = new Set(formData.toolTypes);
      
      data.topics.forEach((topic: string) => {
        const lowerTopic = topic.toLowerCase();
        
        // Match platforms
        availablePlatforms.forEach(p => {
          if (p.toLowerCase() === lowerTopic || (lowerTopic === 'mac' && p.toLowerCase() === 'macos')) {
            newPlatforms.add(p);
          }
        });
        
        // Match types
        availableToolTypes.forEach(t => {
          if (t.toLowerCase().includes(lowerTopic) || lowerTopic.includes(t.toLowerCase())) {
            newTypes.add(t);
          }
        });
      });

      setFormData(prev => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        stars: data.stars,
        forks: data.forks,
        issues: data.issues,
        license: data.license || prev.license,
        heroImageUrl: data.heroImageUrl || prev.heroImageUrl,
        author: data.author || prev.author,
        authorUrl: data.authorUrl || prev.authorUrl,
        since: data.since || prev.since,
        websiteUrl: data.websiteUrl || prev.websiteUrl,
        version: data.version || prev.version,
        platforms: Array.from(newPlatforms),
        toolTypes: Array.from(newTypes)
      }));

      // Pre-fill download assets from the latest release (already junk-filtered
      // and pre-labeled by the server). Only overwrite when the fetch found some,
      // so a manual curation isn't wiped by a release with no assets.
      if (data.downloadAssets && data.downloadAssets.length > 0) {
        setAssets(data.downloadAssets);
      }

      if (data.heroImageUrl && logoTab !== 'link') {
         setLogoTab('link');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to fetch from GitHub');
    } finally {
      setIsFetching(false);
    }
  };

  const updateFeature = (idx: number, key: keyof Feature, value: string) => {
    const newFeatures = [...features];
    newFeatures[idx][key] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (status: 'ACTIVE' | 'DRAFT') => {
    setIsSubmitting(true);
    try {
      const payload: ToolAdminFormData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        status,
        features: JSON.stringify(features),
        installCommand: JSON.stringify(
          commands.filter(c => c.command && c.command.trim() !== '')
        ),
        downloadAssets: JSON.stringify(
          assets.filter(a => a.url && a.url.trim() !== '')
        ),
      };

      let result;
      if (initialData?.id) {
        result = await updateTool(initialData.id, payload);
      } else {
        result = await createTool(payload);
      }
      
      if (!result.success) {
        if (result.error.code === 'SLUG_TAKEN') {
          alert("The URL slug is already taken. Please change it.");
        } else {
          console.error("Failed to save tool:", result.error);
          alert(result.error.message || "Error saving tool.");
        }
        return;
      }
      
      router.push('/admin/tools');
    } catch (error) {
      console.error("Unexpected error saving tool:", error);
      alert("An unexpected error occurred. See console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="font-display-lg text-3xl font-bold text-on-surface tracking-tight">
          {initialData ? 'Edit' : 'Create'} Open-Source Tool
        </h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors font-label-sm text-sm"
          >
            Save Draft
          </button>
          <button 
            onClick={() => handleSubmit('ACTIVE')}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors font-label-sm text-sm"
          >
            {isSubmitting ? 'Saving...' : 'Publish to Gallery'}
          </button>
        </div>
      </div>

      {/* Source & Fetch */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-outline-variant/20">
        <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">GitHub Integration</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant">link</span>
            <input 
              type="text" 
              placeholder="https://github.com/username/repository" 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-12 pr-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors font-body-base text-sm"
              value={formData.repoUrl}
              onChange={e => setFormData({...formData, repoUrl: e.target.value})}
            />
          </div>
          <button 
            onClick={handleFetch}
            disabled={isFetching || !formData.repoUrl}
            className="whitespace-nowrap px-6 py-3 rounded-lg bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{isFetching ? 'sync' : 'auto_awesome'}</span>
            {isFetching ? 'Fetching...' : 'Auto-Fetch Metadata'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Overview */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
          <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">General Details</h2>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Tool Title</label>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary font-body-base text-sm"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">URL Slug</label>
            <input 
              type="text" 
              placeholder="my-awesome-tool"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 text-on-surface focus:border-primary font-body-base text-sm"
              value={formData.slug}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                setFormData({...formData, slug: val});
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Short Description (Cards/Hero)</label>
            <textarea 
              rows={2}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface focus:border-primary font-body-base text-sm resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">About Text (Markdown Body)</label>
            <textarea 
              rows={6}
              placeholder="# Overview\nWrite markdown here..."
              className="w-full bg-[#0d1117] border border-outline-variant/20 rounded-lg p-4 text-[#c9d1d9] font-mono-code text-[13px] focus:border-primary/50 resize-y leading-relaxed"
              value={formData.aboutText}
              onChange={e => setFormData({...formData, aboutText: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
              SEO Meta Description <span className="normal-case text-on-surface-variant/60">(optional — falls back to Description)</span>
            </label>
            <textarea
              rows={2}
              maxLength={160}
              placeholder="The search-result snippet for this tool. ~120–160 chars, lead with the key term."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 text-on-surface text-sm focus:border-primary/50 resize-y leading-relaxed"
              value={formData.metaDescription}
              onChange={e => setFormData({...formData, metaDescription: e.target.value})}
            />
            <span className="text-[10px] text-on-surface-variant/60 self-end">
              {formData.metaDescription.length}/160
            </span>
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
          <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Metadata & Taxonomy</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Author Name</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Author URL</label>
              <input type="text" placeholder="https://github.com/..." className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.authorUrl} onChange={e => setFormData({...formData, authorUrl: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Since (Year)</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.since} onChange={e => setFormData({...formData, since: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">License</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Version</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Website URL</label>
            <input type="text" placeholder="https://" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Download URL (single-link fallback — e.g. Android APK)</label>
            <input type="text" placeholder="https://" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.downloadUrl} onChange={e => setFormData({...formData, downloadUrl: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Tool Types</label>
            <div className="flex flex-wrap gap-2">
              {availableToolTypes.map(name => {
                const selected = formData.toolTypes.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? formData.toolTypes.filter(t => t !== name)
                        : [...formData.toolTypes, name];
                      setFormData({ ...formData, toolTypes: next });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-[#2d0096] text-white border-[#2d0096]'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-[#2d0096]/50 hover:text-on-surface'
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}{name}
                  </button>
                );
              })}
              {availableToolTypes.length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No tool categories found. Add some in the Categories section.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Platforms (OS)</label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map(name => {
                const selected = formData.platforms.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? formData.platforms.filter(p => p !== name)
                        : [...formData.platforms, name];
                      setFormData({ ...formData, platforms: next });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-[#2d0096] text-white border-[#2d0096]'
                        : 'bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:border-[#2d0096]/50 hover:text-on-surface'
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}{name}
                  </button>
                );
              })}
              {availablePlatforms.length === 0 && (
                <p className="text-xs text-on-surface-variant italic">No platforms found. Add some in the Categories section.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Capabilities / Features */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
        <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Capability Features (Exactly 3)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-4 flex flex-col gap-3 relative">
              <div className="flex gap-3 items-center">
                <span className="material-symbols-outlined text-[20px] text-primary">{feat.icon}</span>
                <input type="text" placeholder={`Feature ${idx + 1} Title`} className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1.5 text-xs text-on-surface" value={feat.title} onChange={e => updateFeature(idx, 'title', e.target.value)} />
              </div>
              <textarea placeholder="Feature description..." rows={2} className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1.5 text-xs text-on-surface resize-none" value={feat.description} onChange={e => updateFeature(idx, 'description', e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      {/* Installation Commands */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-outline-variant/20">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Installation Commands (Per OS)</h2>
            <p className="text-[11px] text-on-surface-variant">Terminal install only. GUI/Android tools: leave empty and use Download Assets below.</p>
          </div>
          <button
            type="button"
            onClick={() => setCommands([...commands, { os: 'Universal', command: '' }])}
            className="shrink-0 text-[11px] font-bold tracking-wider uppercase bg-primary-container/10 px-3 py-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors border border-primary/20"
          >
            + Add OS Option
          </button>
        </div>

        {commands.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic px-1">No install commands — the public page will show the download options instead of a terminal.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {commands.map((cmd, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/20 relative group">
                <button
                  type="button"
                  onClick={() => setCommands(commands.filter((_, i) => i !== idx))}
                  className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-error/20 hover:bg-error/20"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>

                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Target OS / Platform</label>
                  <div className="relative w-full sm:w-1/2">
                    <select
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-3 pr-10 py-2 text-sm text-on-surface focus:border-primary appearance-none cursor-pointer"
                      value={cmd.os}
                      onChange={e => {
                        const next = [...commands];
                        next[idx] = { ...next[idx], os: e.target.value };
                        setCommands(next);
                      }}
                    >
                      {OS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Shell Command</label>
                  <textarea
                    placeholder="# e.g. curl -fsSL https://ollama.com/install.sh | sh"
                    className="w-full bg-[#0d1117] border border-outline-variant/20 rounded-lg p-4 text-[#c9d1d9] font-mono-code text-[13px] focus:border-primary/50 resize-y"
                    rows={2}
                    value={cmd.command}
                    onChange={e => {
                      const next = [...commands];
                      next[idx] = { ...next[idx], command: e.target.value };
                      setCommands(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Live preview — renders the exact public terminal so the editor and
            output stay in sync. */}
        {commands.some(c => c.command && c.command.trim() !== '') && (
          <div className="flex flex-col gap-2 pt-2">
            <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Live Preview (what users see)</label>
            <InstallSection
              toolName={formData.name || 'this tool'}
              installCommand={JSON.stringify(commands.filter(c => c.command && c.command.trim() !== ''))}
            />
          </div>
        )}
      </div>

      {/* Download Assets (multi-arch release files) */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 border border-outline-variant/20">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Download Assets (Per Architecture)</h2>
            <p className="text-[11px] text-on-surface-variant">Auto-Fetch pre-fills these from the latest release. One asset → direct download; multiple → a chooser modal on the public page.</p>
          </div>
          <button
            type="button"
            onClick={() => setAssets([...assets, { label: '', url: '' }])}
            className="shrink-0 text-[11px] font-bold tracking-wider uppercase bg-primary-container/10 px-3 py-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors border border-primary/20"
          >
            + Add Asset
          </button>
        </div>

        {assets.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic px-1">No download assets. Use the single Download URL field above for a one-link download (e.g. an Android APK), or Auto-Fetch a release.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {assets.map((asset, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:items-center p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 relative group">
                <input
                  type="text"
                  placeholder="Label (e.g. macOS · Apple Silicon)"
                  className="sm:w-1/3 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary"
                  value={asset.label}
                  onChange={e => {
                    const next = [...assets];
                    next[idx] = { ...next[idx], label: e.target.value };
                    setAssets(next);
                  }}
                />
                <input
                  type="text"
                  placeholder="https://github.com/.../download/v1.2/app-arm64.dmg"
                  className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary font-mono-code text-[12px]"
                  value={asset.url}
                  onChange={e => {
                    const next = [...assets];
                    next[idx] = { ...next[idx], url: e.target.value };
                    setAssets(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setAssets(assets.filter((_, i) => i !== idx))}
                  className="self-end sm:self-auto w-8 h-8 shrink-0 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 border border-error/20"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assets Manager */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
        <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Media Assets</h2>
        
        <div className="flex flex-col gap-6">
          {/* Part 1: Logo */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Thumbnail Preview</label>
              <div className="flex border-b border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setLogoTab('upload')}
                  className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    logoTab === 'upload' ? 'border-[#2d0096] text-[#2d0096]' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setLogoTab('link')}
                  className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    logoTab === 'link' ? 'border-[#2d0096] text-[#2d0096]' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-on-surface">Thumbnail Image</p>

            {logoTab === 'upload' ? (
              <>
                {formData.heroImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest">
                    <img src={formData.heroImageUrl} alt="Logo" className="w-full h-32 object-contain p-4" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, heroImageUrl: '' })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 border border-error/20"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors cursor-pointer py-8 ${
                      isDraggingLogo
                        ? 'border-[#2d0096] bg-[#2d0096]/5'
                        : 'border-outline-variant/40 hover:border-[#2d0096]/50 hover:bg-surface-container-low'
                    } ${isUploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragOver={e => { e.preventDefault(); setIsDraggingLogo(true); }}
                    onDragLeave={() => setIsDraggingLogo(false)}
                    onDrop={handleLogoDrop}
                  >
                    <span className="material-symbols-outlined text-[40px] text-[#2d0096]/60">image</span>
                    <p className="text-sm font-medium text-on-surface">
                      {isUploadingLogo ? 'Uploading...' : <><span className="text-on-surface-variant">Drag & drop or </span><span className="text-[#2d0096] underline underline-offset-2">browse</span></>}
                    </p>
                    <p className="text-xs text-on-surface-variant">Supports image/*</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                  </label>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary transition-colors"
                  value={formData.heroImageUrl}
                  onChange={e => setFormData({ ...formData, heroImageUrl: e.target.value })}
                />
                {formData.heroImageUrl && (
                  <div className="w-16 h-16 rounded overflow-hidden bg-[#1f2233] border border-outline-variant/20 flex items-center justify-center">
                    <img src={formData.heroImageUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-1" />
                  </div>
                )}
              </div>
            )}
            <p className="text-[10px] text-on-surface-variant">Used as the primary brand logo / header image.</p>
          </div>

          {/* Part 2: Pictures / Gallery */}
          <div className="flex flex-col gap-3">
            {/* Header row: label + ratio toggle + upload/link tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Gallery Pictures (Max 4)</label>
              <div className="flex items-center gap-3">
                {/* Upload / Link tabs */}
                <div className="flex border-b border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setGalleryTab('upload')}
                    className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      galleryTab === 'upload' ? 'border-[#2d0096] text-[#2d0096]' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryTab('link')}
                    className={`px-4 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                      galleryTab === 'link' ? 'border-[#2d0096] text-[#2d0096]' : 'border-transparent text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Link
                  </button>
                </div>
                {/* Aspect Ratio Toggle */}
                <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/30">
                  <button
                    type="button"
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${formData.galleryLayout === '16:9' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-white'}`}
                    onClick={() => setFormData({...formData, galleryLayout: '16:9'})}
                  >
                    16:9
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${formData.galleryLayout === '9:16' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-white'}`}
                    onClick={() => setFormData({...formData, galleryLayout: '9:16'})}
                  >
                    9:16
                  </button>
                </div>
              </div>
            </div>

            {(() => {
              let images: string[] = [];
              try { images = JSON.parse(formData.galleryImages || '[]'); } catch (e) {}

              const is169 = formData.galleryLayout === '16:9';
              // 16:9 → 2-col grid (landscape), 9:16 → 4-col row (portrait)
              const gridClass = is169 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-3';
              const aspectClass = is169 ? 'aspect-video' : 'aspect-[9/16]';

              if (galleryTab === 'link') {
                return (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[11px] text-on-surface-variant w-16 shrink-0">Picture {idx + 1}</span>
                        <input
                          type="text"
                          placeholder="https://..."
                          className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary transition-colors"
                          value={images[idx] || ''}
                          onChange={e => {
                            const newImages = [...images];
                            while (newImages.length <= idx) newImages.push('');
                            newImages[idx] = e.target.value;
                            setFormData({...formData, galleryImages: JSON.stringify(newImages.filter(Boolean))});
                          }}
                        />
                        {images[idx] && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...images];
                              newImages[idx] = '';
                              setFormData({...formData, galleryImages: JSON.stringify(newImages.filter(Boolean))});
                            }}
                            className="w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 border border-error/20 shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className={gridClass}>
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const isUploading = uploadingGallery[idx];
                    const isDragging = isDraggingGallery[idx];
                    const imageUrl = images[idx] || '';

                    return imageUrl ? (
                      <div key={idx} className={`relative rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest ${aspectClass}`}>
                        <img src={imageUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = [...images];
                            newImages[idx] = '';
                            setFormData({...formData, galleryImages: JSON.stringify(newImages.filter(Boolean))});
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded">{idx + 1}</span>
                      </div>
                    ) : (
                      <label
                        key={idx}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${aspectClass} ${
                          isDragging
                            ? 'border-[#2d0096] bg-[#2d0096]/5'
                            : 'border-outline-variant/40 hover:border-[#2d0096]/50 hover:bg-surface-container-low'
                        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        onDragOver={e => { e.preventDefault(); setIsDraggingGallery(prev => ({ ...prev, [idx]: true })); }}
                        onDragLeave={() => setIsDraggingGallery(prev => ({ ...prev, [idx]: false }))}
                        onDrop={e => handleGalleryDrop(e as any, idx)}
                      >
                        <span className={`material-symbols-outlined text-[#2d0096]/60 ${is169 ? 'text-[28px]' : 'text-[22px]'}`}>add_photo_alternate</span>
                        <p className="text-[11px] text-on-surface-variant text-center px-2">
                          {isUploading ? 'Uploading...' : <><span>Drop or </span><span className="text-[#2d0096] underline underline-offset-1">browse</span></>}
                        </p>
                        <span className="text-[10px] text-on-surface-variant/60">{idx + 1}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleGalleryUpload(e, idx)} disabled={isUploading} />
                      </label>
                    );
                  })}
                </div>
              );
            })()}
            <p className="text-[10px] text-on-surface-variant">
              {formData.galleryLayout === '16:9' ? '16:9 — landscape, 2×2 grid.' : '9:16 — portrait, 4-column row.'}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
