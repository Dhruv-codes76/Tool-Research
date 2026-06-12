import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { AboutSection } from '@/components/tools/AboutSection';
import { InstallSection } from '@/components/tools/InstallSection';
import { DownloadButton } from '@/components/tools/DownloadButton';
import { ImageGallery } from '@/components/tools/ImageGallery';

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aitoolresearch.com";

async function findTool(toolId: string) {
  return prisma.tool.findFirst({
    where: {
      OR: [
        { id: toolId },
        { name: { equals: toolId } },
        { repoUrl: { contains: `/${toolId}` } },
      ],
    },
    include: { platforms: true, toolTypes: true },
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const tool = await findTool(id);

  if (!tool) {
    return {
      title: "Tool Not Found | AI Tool Research",
      robots: { index: false, follow: false },
    };
  }

  const title = `${tool.name} — Open-Source AI Tool | AI Tool Research`;
  const description = (tool.description || tool.aboutText || `Discover ${tool.name}, a curated open-source AI tool.`).slice(0, 160);
  const image = tool.heroImageUrl || tool.imageUrl || undefined;
  const canonical = `${SITE_URL}/tools/${tool.id}`;
  // Only ACTIVE tools should be indexed; drafts/soft-deleted stay out of search.
  const indexable = tool.status === "ACTIVE";

  return {
    title,
    description,
    alternates: { canonical },
    robots: indexable ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: "AI Tool Research",
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ToolDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const toolId = resolvedParams.id;

  // Query tool dynamically by ID (or name / repo slug)
  const dbTool = await findTool(toolId);

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
  // Golden Rule: Strict adherence to existing data without fallbacks
  const installCommand = dbTool.installCommand || "";
  const aboutText = dbTool.aboutText || dbTool.description || "No description provided.";
  const author = dbTool.author;
  const since = dbTool.since;
  const license = dbTool.license;
  const version = dbTool.version;
  const website = dbTool.websiteUrl;
  const downloadUrl = dbTool.downloadUrl;

  const formattedStars = dbTool.stars >= 1000 
    ? (dbTool.stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : dbTool.stars.toString();

  const formattedForks = dbTool.forks >= 1000 
    ? (dbTool.forks / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    : dbTool.forks.toString();

  const categoryLabel = dbTool.toolTypes[0]?.name || 'OPEN SOURCE TOOL';

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
            className="relative rounded-xl overflow-hidden mb-8 border border-white/5 bg-[#09090b] min-h-[290px] flex flex-col"
            style={stellarGlowStyle}
          >
            {/* Blurred background image to simulate extracting colors from logo */}
            {(dbTool.heroImageUrl || dbTool.imageUrl) && (
              <div
                className="absolute inset-0 opacity-60 blur-[100px] scale-150 saturate-200 brightness-50 mix-blend-screen"
                style={{
                  backgroundImage: `url(${dbTool.heroImageUrl || dbTool.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}

            {/* Ambient bottom glow matching the reference image */}
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80%] h-64 bg-indigo-500/15 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40%] h-64 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
            
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-[#09090b]/70 backdrop-blur-[10px]"></div>

            <div className="absolute top-4 left-6 right-6 md:top-5 md:left-8 md:right-8 z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {(dbTool.toolTypes.length > 0
                  ? dbTool.toolTypes.map(t => t.name)
                  : [categoryLabel]
                ).map(name => (
                  <span key={name} className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full text-[10px] font-bold border border-primary-container/20 tracking-wider">
                    {name.toUpperCase()}
                  </span>
                ))}
              </div>
              <h1 className="font-sans text-4xl md:text-7xl text-white mb-2 tracking-tighter font-black drop-shadow-xl md:mt-0 mt-2 pr-2">
                {dbTool.name}
              </h1>
              <p className="text-white font-sans max-w-2xl text-base md:text-lg leading-relaxed font-semibold drop-shadow-xl">
                {dbTool.description}
              </p>
              <div className="flex items-center gap-4 mt-4 bg-black/60 backdrop-blur-xl w-fit px-5 py-2.5 rounded-full border border-white/20 shadow-lg">
                <span className="text-white flex items-center gap-1.5 text-sm font-bold drop-shadow-md">
                  <span className="material-symbols-outlined text-yellow-400 text-base drop-shadow-md">star</span>
                  {formattedStars} Stars
                </span>
                <span className="text-white flex items-center gap-1.5 text-sm font-bold drop-shadow-md">
                  <span className="material-symbols-outlined text-gray-300 text-base drop-shadow-md">fork_right</span>
                  {formattedForks} Forks
                </span>
              </div>
              {version && (
                <div className="mt-3 text-sm text-white/90 flex items-center gap-1.5 font-medium drop-shadow-md">
                  <span className="material-symbols-outlined text-base">update</span>
                  Version: <span className="text-white font-bold">{version}</span>
                </div>
              )}
              
              {/* Action Buttons */}
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-auto pt-8">
                {/* View Repo Button */}
                <a 
                  href={dbTool.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-4 bg-white/20 backdrop-blur-xl border border-white/30 text-white pl-5 pr-2 py-2 rounded-full font-sans font-bold text-sm hover:bg-white/30 hover:scale-[1.02] transition-all shadow-2xl w-fit group"
                >
                  <span className="tracking-wide lowercase font-semibold drop-shadow-sm">view repo</span>
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

                {/* Download Button — single asset → direct link, multiple → chooser modal */}
                <DownloadButton
                  downloadUrl={downloadUrl}
                  downloadAssets={dbTool.downloadAssets}
                  repoUrl={dbTool.repoUrl}
                />
              </div>
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

              <ImageGallery images={images} imageRatio={imageRatio} toolName={dbTool.name} />
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
              style={{ ...glassStyle, ...stellarGlowStyle, backgroundColor: "rgba(10, 10, 15, 0.7)" }}
            >
              {author && (
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                  <span className="text-on-surface-variant">Author</span>
                  <span className="text-on-surface font-bold">{author}</span>
                </div>
              )}
              {since && (
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                  <span className="text-on-surface-variant">Since</span>
                  <span className="text-on-surface font-bold">{since}</span>
                </div>
              )}
              {license && (
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30 text-sm">
                  <span className="text-on-surface-variant">License</span>
                  <span className="text-on-surface font-bold">{license}</span>
                </div>
              )}
              
              {dbTool.platforms.length > 0 && (
                <div className="flex justify-between items-start gap-3 py-2 border-b border-outline-variant/30 text-sm">
                  <span className="text-on-surface-variant shrink-0 pt-0.5">OS</span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {dbTool.platforms.map(p => (
                      <span key={p.name} className="bg-on-surface-variant/10 text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-outline-variant/30 tracking-wider">
                        {p.name.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
            <div className="p-6 rounded-2xl space-y-4" style={{ ...glassStyle, backgroundColor: "rgba(10, 10, 15, 0.7)" }}>
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
