"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTool, updateTool, ToolAdminFormData } from '@/app/actions/adminActions';
import { uploadToolImage } from '@/lib/supabase';

type Feature = { title: string; description: string; icon: string };

export function ToolForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('windows');
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState<Record<number, boolean>>({});

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const [formData, setFormData] = useState<ToolAdminFormData>({
    repoUrl: initialData?.repoUrl || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    stars: initialData?.stars || 0,
    forks: initialData?.forks || 0,
    issues: initialData?.issues || 0,
    status: initialData?.status || 'ACTIVE',
    aboutText: initialData?.aboutText || '',
    version: initialData?.version || '',
    license: initialData?.license || '',
    installCommand: initialData?.installCommand || '',
    heroImageUrl: initialData?.heroImageUrl || '',
    galleryImages: initialData?.galleryImages || '[]',
    galleryLayout: initialData?.galleryLayout || '16:9',
    features: initialData?.features || '[]',
    author: initialData?.author || '',
    since: initialData?.since || '',
    websiteUrl: initialData?.websiteUrl || '',
    platforms: initialData?.platforms?.map((p: any) => p.name) || ['Agnostic'],
    toolTypes: initialData?.toolTypes?.map((t: any) => t.name) || ['Developer Tool'],
  });

  const handleFetch = async () => {
    if (!formData.repoUrl) return;
    setIsFetching(true);
    // In a real scenario, this calls autoFillFromGitHub server action
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: 'Auto-fetched Tool Name',
        description: 'Auto-fetched description from GitHub repository.',
        stars: 1200,
        forks: 150,
        license: 'MIT',
      }));
      setIsFetching(false);
    }, 1000);
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
        status,
        features: JSON.stringify(features),
      };

      if (initialData?.id) {
        await updateTool(initialData.id, payload);
      } else {
        await createTool(payload);
      }
      
      router.push('/admin/tools');
    } catch (error) {
      console.error("Failed to save tool", error);
      alert("Error saving tool. See console.");
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
        </div>

        {/* Sidebar Metadata */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
          <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Metadata & Taxonomy</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Author</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Since (Year)</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.since} onChange={e => setFormData({...formData, since: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">License</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Version</label>
              <input type="text" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Website URL</label>
            <input type="text" placeholder="https://" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Tool Types (Comma separated)</label>
            <input type="text" placeholder="AI Agent, CLI Tool" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.toolTypes.join(', ')} onChange={e => setFormData({...formData, toolTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Platforms (Comma separated)</label>
            <input type="text" placeholder="macOS, Linux, Windows" className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm" value={formData.platforms.join(', ')} onChange={e => setFormData({...formData, platforms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} />
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
          <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Installation Commands (Per OS)</h2>
          <button 
            onClick={() => {
              try {
                const current = JSON.parse(formData.installCommand || '[]');
                const parsed = Array.isArray(current) ? current : [{ os: 'Universal', command: formData.installCommand }];
                setFormData({...formData, installCommand: JSON.stringify([...parsed, { os: 'Windows', command: '' }])});
              } catch(e) {
                setFormData({...formData, installCommand: JSON.stringify([{ os: 'macOS & Linux', command: formData.installCommand }, { os: 'Windows', command: '' }])});
              }
            }}
            className="text-[11px] font-bold tracking-wider uppercase bg-primary-container/10 px-3 py-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors border border-primary/20"
          >
            + Add OS Option
          </button>
        </div>
        
        {(() => {
          let commands = [];
          try {
            commands = JSON.parse(formData.installCommand || '[]');
            if (!Array.isArray(commands)) commands = [{ os: 'Universal', command: formData.installCommand }];
          } catch(e) {
            commands = [{ os: 'Universal', command: formData.installCommand }];
          }

          if (commands.length === 0) {
             commands = [{ os: 'Universal', command: '' }];
          }

          return (
            <div className="flex flex-col gap-4">
              {commands.map((cmd: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-3 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/20 relative group">
                  
                  {commands.length > 1 && (
                    <button
                      onClick={() => {
                        const newCommands = commands.filter((_: any, i: number) => i !== idx);
                        setFormData({...formData, installCommand: JSON.stringify(newCommands)});
                      }}
                      className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-error/20 hover:bg-error/20"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-wider">Target OS / Platform</label>
                    <div className="relative w-full sm:w-1/2">
                      <select
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-3 pr-10 py-2 text-sm text-on-surface focus:border-primary appearance-none cursor-pointer"
                        value={cmd.os}
                        onChange={e => {
                          const newCommands = [...commands];
                          newCommands[idx].os = e.target.value;
                          setFormData({...formData, installCommand: JSON.stringify(newCommands)});
                        }}
                      >
                        <option value="Universal">Universal</option>
                        <option value="macOS">macOS</option>
                        <option value="Windows">Windows</option>
                        <option value="Linux">Linux</option>
                        <option value="macOS & Linux">macOS & Linux</option>
                        <option value="Docker">Docker</option>
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
                        const newCommands = [...commands];
                        newCommands[idx].command = e.target.value;
                        setFormData({...formData, installCommand: JSON.stringify(newCommands)});
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Assets Manager */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-5 border border-outline-variant/20">
        <h2 className="font-label-sm text-sm text-on-surface uppercase tracking-wider">Media Assets</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Part 1: Logo */}
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider">Logo (Part 1)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://..." 
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary transition-colors" 
                value={formData.heroImageUrl} 
                onChange={e => setFormData({...formData, heroImageUrl: e.target.value})} 
              />
              <label className={`cursor-pointer bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest px-4 py-2 rounded-lg font-label-sm text-sm transition-colors flex items-center justify-center ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isUploadingLogo ? 'Uploading...' : 'Upload'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload} 
                  disabled={isUploadingLogo}
                />
              </label>
            </div>
            {formData.heroImageUrl && (
               <div className="mt-1 w-16 h-16 rounded overflow-hidden bg-[#1f2233] border border-outline-variant/20 flex items-center justify-center">
                 <img src={formData.heroImageUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-1" />
               </div>
            )}
            <p className="text-[10px] text-on-surface-variant">Used as the primary brand logo / header image.</p>
          </div>

          {/* Part 2: Pictures / Gallery */}
          <div className="flex flex-col gap-3">
            <label className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider flex justify-between items-center">
              <span>Gallery Pictures (Max 4)</span>
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
            </label>

            {/* Inputs for up to 4 images */}
            {(() => {
              let images: string[] = [];
              try {
                images = JSON.parse(formData.galleryImages || '[]');
              } catch (e) {}

              return (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, idx) => {
                    const isUploading = uploadingGallery[idx];
                    return (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={`Picture ${idx + 1} URL`} 
                          className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-sm focus:border-primary transition-colors" 
                          value={images[idx] || ''} 
                          onChange={e => {
                            const newImages = [...images];
                            while (newImages.length <= idx) newImages.push('');
                            newImages[idx] = e.target.value;
                            setFormData({...formData, galleryImages: JSON.stringify(newImages.filter(Boolean))});
                          }} 
                        />
                        <label className={`cursor-pointer bg-surface-container-high border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest px-4 py-2 rounded-lg font-label-sm text-sm transition-colors flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isUploading ? 'Uploading...' : 'Upload'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleGalleryUpload(e, idx)} 
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {formData.galleryLayout === '16:9' 
                      ? 'Displays as 2 columns (two squares).' 
                      : 'Displays as 4 columns.'}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      
    </div>
  );
}
