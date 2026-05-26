import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AboutSection } from '@/components/tools/AboutSection';
import { InstallSection } from '@/components/tools/InstallSection';

const glassStyle = {
  background: "rgba(28, 32, 37, 0.4)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const stellarGlowStyle = {
  boxShadow: "0 0 30px rgba(62, 166, 255, 0.1)",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ToolDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const toolId = resolvedParams.id;

  // Query tool dynamically from SQLite by ID (or case-insensitive name)
  const dbTool = await prisma.tool.findFirst({
    where: {
      OR: [
        { id: toolId },
        { name: { equals: toolId } },
        { repoUrl: { contains: `/${toolId}` } }
      ]
    },
    include: {
      platforms: true,
      toolTypes: true
    }
  });

  if (!dbTool) {
    return (
      <main className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center text-white px-4">
        <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center space-y-6 border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-primary-container block">warning</span>
          <h1 className="font-headline-md text-2xl">Tool Not Found</h1>
          <p className="text-on-surface-variant text-sm font-body-base leading-relaxed">
            The requested tool ID <code className="bg-[#1c2025] px-2 py-1 rounded text-xs">{toolId}</code> is not present in our database. It might have been removed or never submitted.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/tools" className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-label-sm hover:bg-primary-container/80 transition-colors">
              EXPLORE INDEX
            </Link>
            <Link href="/" className="text-on-surface-variant hover:text-white transition-colors text-xs font-semibold">
              Go Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Bind dynamic details from database
  const installCommand = dbTool.installCommand || `git clone ${dbTool.repoUrl}.git`;
  const aboutText = dbTool.aboutText || dbTool.description || "No description provided.";
  const author = dbTool.author || "Community";
  const since = dbTool.since || "N/A";
  const license = dbTool.license || "Open Source";
  const version = dbTool.version || "1.0.0 Stable";
  const website = dbTool.websiteUrl || dbTool.repoUrl;

  const formattedStars = dbTool.stars >= 1000 
    ? (dbTool.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : dbTool.stars.toString();

  const formattedForks = dbTool.forks >= 1000 
    ? (dbTool.forks / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : dbTool.forks.toString();

  const categoryLabel = dbTool.toolTypes[0]?.name || 'OPEN SOURCE TOOL';
  const tagLabel = dbTool.platforms[0]?.name || 'V1.0 STABLE';

  // Parse JSON fields
  let features: {title: string, description: string, icon: string}[] = [];
  try {
    if (dbTool.features) features = JSON.parse(dbTool.features);
  } catch (e) {}
  
  if (features.length === 0) {
    features = [
      { title: 'Open Source', description: '100% community audited and freely modifiable code.', icon: 'bolt' },
      { title: 'Vetted Quality', description: 'Curated by the AI Tool Research developer review team.', icon: 'lock' },
      { title: 'Extensible', description: 'Easily pluggable with custom plugins or standard pipelines.', icon: 'extension' }
    ];
  }

  let images: string[] = [];
  try {
    if (dbTool.galleryImages) images = JSON.parse(dbTool.galleryImages);
  } catch (e) {}

  // Fallback to a placeholder if no images and no hero
  if (images.length === 0 && !dbTool.heroImageUrl) {
    images = ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"];
  }

  const imageRatio = dbTool.galleryLayout === '9:16' ? '9:16' : '16:9';

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-24 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Main) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Section */}
          <div 
            className="relative rounded-xl overflow-hidden aspect-[16/9] lg:aspect-auto lg:h-[290px] mb-8 border border-white/5 bg-[#09090b]"
            style={{
              ...stellarGlowStyle,
              ...(dbTool.heroImageUrl ? {
                backgroundImage: `url(${dbTool.heroImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {})
            }}
          >
            {/* Ambient bottom glow matching the reference image */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-indigo-500/15 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40%] h-64 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            {/* Dark overlay for readability if using a hero image */}
            {dbTool.heroImageUrl && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>}

            <div className="absolute top-4 left-6 right-6 md:top-5 md:left-8 md:right-8 z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full text-[10px] font-bold border border-primary-container/20 tracking-wider">
                  {categoryLabel.toUpperCase()}
                </span>
                <span className="bg-on-surface-variant/10 text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold border border-outline-variant/30 tracking-wider">
                  {tagLabel.toUpperCase()}
                </span>
              </div>
              <h1 className="font-display-lg text-3xl md:text-5xl text-on-surface mb-2 tracking-tight">
                {dbTool.name}
              </h1>
              <p className="text-on-surface-variant font-body-base max-w-2xl text-sm md:text-base leading-relaxed">
                {dbTool.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-on-surface flex items-center gap-1.5 text-sm font-semibold">
                  <span className="material-symbols-outlined text-primary text-base">star</span>
                  {formattedStars} Stars
                </span>
                <span className="text-on-surface flex items-center gap-1.5 text-sm font-semibold">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">fork_right</span>
                  {formattedForks} Forks
                </span>
              </div>
              <div className="mt-2 text-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">update</span>
                Version: <span className="text-on-surface font-semibold">{version}</span>
              </div>
              {/* View Repo Button */}
              <a 
                href={dbTool.repoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-4 bg-[#181922] text-gray-200 pl-4 pr-1 py-1 rounded-full font-mono text-sm mt-2 hover:scale-[1.02] transition-transform shadow-xl w-fit group"
              >
                <span className="tracking-wide lowercase">view repo</span>
                <div className="bg-[#ffa6ff] text-black w-7 h-7 rounded-full flex items-center justify-center group-hover:bg-[#ffb3ff] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2" cy="7" r="1.2" />
                    <circle cx="5" cy="7" r="1.2" />
                    <circle cx="8" cy="7" r="1.2" />
                    <circle cx="11" cy="7" r="1.2" />
                    <circle cx="8" cy="4" r="1.2" />
                    <circle cx="5" cy="1.5" r="1.2" />
                    <circle cx="8" cy="10" r="1.2" />
                    <circle cx="5" cy="12.5" r="1.2" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Description Section - Interactive Client Island */}
          <AboutSection aboutText={aboutText} />

          {/* Images Gallery Section */}
          {images && images.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-headline-md text-base md:text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-xl">gallery_thumbnail</span>
                Gallery
              </h3>

              <div className={`grid gap-3 transition-all duration-500 ease-in-out ${
                imageRatio === '9:16' 
                  ? 'grid-cols-4' 
                  : (images.length === 1 ? 'grid-cols-1' : 'grid-cols-2')
              }`}>
                {images.map((imgUrl, i) => {
                  const processedImgUrl = imageRatio === '9:16'
                    ? imgUrl.replace('fit=crop&w=800&q=80', 'fit=crop&w=600&h=1067&q=80')
                    : imgUrl;

                  return (
                    <div 
                      key={i} 
                      className={`rounded-xl overflow-hidden border border-outline-variant/30 relative group cursor-pointer transition-all duration-500 ${
                        imageRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
                      }`}
                    >
                      <img 
                        alt={`${dbTool.name} preview ${i + 1}`}
                        src={processedImgUrl}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-on-surface text-lg">zoom_in</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Installation Section - Interactive Client Island */}
          <InstallSection toolName={dbTool.name} installCommand={installCommand} />

        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            {/* Metadata Card */}
            <div 
              className="p-6 rounded-2xl flex flex-col justify-between space-y-4"
              style={{ ...glassStyle, ...stellarGlowStyle }}
            >
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                <span className="text-on-surface-variant">Author</span>
                <span className="text-on-surface font-bold">{author}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                <span className="text-on-surface-variant">Since</span>
                <span className="text-on-surface font-bold">{since}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                <span className="text-on-surface-variant">License</span>
                <span className="text-on-surface font-bold">{license}</span>
              </div>
              
              {website && (
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-on-surface-variant">Website</span>
                  <a 
                    href={website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-bold truncate max-w-[200px] text-right"
                  >
                    {website}
                  </a>
                </div>
              )}
            </div>

            {/* Capability Card */}
            <div className="p-6 rounded-2xl space-y-4" style={glassStyle}>
              <h3 className="font-headline-md text-on-surface text-lg">Capability</h3>
              <div className="flex flex-col gap-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container shrink-0">
                      <span className="material-symbols-outlined text-base">{feature.icon}</span>
                    </div>
                    <div>
                      <div className="text-on-surface text-sm font-bold">{feature.title}</div>
                      <div className="text-xs text-on-surface-variant leading-relaxed mt-0.5">{feature.description || (feature as any).desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
