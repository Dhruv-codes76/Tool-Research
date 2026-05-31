'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import Link from 'next/link';

const ScrollRevealWord = ({ children, progress, range }: { children: React.ReactNode, progress: MotionValue<number>, range: [number, number] }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mx-[0.12em] text-white">
      {children}
    </motion.span>
  );
};

const BeliefsSection = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start 80%", "end 50%"]
  });

  const lines = [
    "Software should respect its users.",
    "Privacy should be the default.",
    "Transparency builds trust.",
    "The future should be open."
  ];

  const totalWords = lines.join(" ").split(" ").filter(w => w.length > 0).length;

  return (
    <section ref={targetRef} className="py-40 md:py-60 px-6 border-t border-outline-variant/10 bg-surface-container-lowest/20">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-primary uppercase tracking-[0.3em] text-xs mb-16 font-mono">
          What We Believe
        </p>
        <div className="flex flex-col space-y-8 md:space-y-12">
          {lines.map((line, lineIndex) => {
            const words = line.split(" ").filter(w => w.length > 0);
            return (
              <h2 key={lineIndex} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                {words.map((word, wordIndex) => {
                  const currentWordIndex = lines.slice(0, lineIndex).join(" ").split(" ").filter(w => w.length > 0).length + wordIndex;
                  const start = currentWordIndex / totalWords;
                  const end = (currentWordIndex + 1) / totalWords;
                  
                  return (
                    <ScrollRevealWord key={wordIndex} progress={scrollYProgress} range={[start, end]}>
                      {word}
                    </ScrollRevealWord>
                  );
                })}
              </h2>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x, y });
  };

  // Timeline list mapping brand-specific styles for visual rhythm
  const timelineItems = [
    {
      year: "1991",
      title: "Linux",
      desc: "Linux transformed a student's hobby project into the foundation of the modern internet. Today, it powers everything from smartphones and cloud servers to supercomputers worldwide.",
      colorClass: "text-primary",
      glowColor: "rgba(195, 192, 255, 0.7)",
      accentClass: "border-primary/20 bg-primary/[0.02]"
    },
    {
      year: "2002",
      title: "Firefox",
      desc: "The browser that defended the open web and challenged monopolies through openness and innovation.",
      colorClass: "text-secondary",
      glowColor: "rgba(137, 206, 255, 0.7)",
      accentClass: "border-secondary/20 bg-secondary/[0.02]"
    },
    {
      year: "2001",
      title: "VLC",
      desc: "VLC proved that great software doesn't need ads, subscriptions, or restrictions. Built by a passionate open-source community, it became the world's most trusted media player by putting users first.",
      colorClass: "text-tertiary",
      glowColor: "rgba(255, 182, 149, 0.7)",
      accentClass: "border-tertiary/20 bg-tertiary/[0.02]"
    },
    {
      year: "2016",
      title: "Brave",
      desc: "A privacy-first browser proving that users don't need to sacrifice freedom for convenience.",
      colorClass: "text-primary-fixed-dim",
      glowColor: "rgba(195, 192, 255, 0.7)",
      accentClass: "border-primary-fixed/20 bg-primary-fixed/[0.02]"
    }
  ];

  // Motion animation presets
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  } as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-on-surface selection:bg-primary selection:text-on-primary overflow-x-hidden pt-16 font-sans">

      {/* Premium Hero Section with Mouse Cursor Aura tracking */}
      <section
        className="relative py-40 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.1),transparent_60%)] pointer-events-none z-0" />

        {/* Dynamic Glowing Blob */}
        <motion.div
          className="absolute w-[350px] h-[350px] bg-gradient-to-br from-primary/20 via-secondary/10 to-tertiary/20 blur-[100px] rounded-full pointer-events-none z-0"
          animate={{
            x: isHovered ? mousePos.x * 0.35 : 0,
            y: isHovered ? mousePos.y * 0.35 + scrollY * 0.15 : scrollY * 0.15,
            scale: isHovered ? 1.15 : 1.0
          }}
          transition={{ type: "spring", stiffness: 80, damping: 25 }}
          style={{
            left: "calc(50% - 175px)",
            top: "calc(35% - 175px)"
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.p
            className="text-primary uppercase tracking-[0.3em] text-xs mb-6 font-mono font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Main / About Us
          </motion.p>

          <motion.h1
            className="text-6xl md:text-8xl lg:text-[9.5rem] font-black tracking-tight text-white leading-[0.95] mb-10 lowercase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            The Internet
            <br />
            Wasn't Meant
            <br />
            To Be Rented.
          </motion.h1>

          <motion.p
            className="max-w-3xl mx-auto text-on-surface-variant text-lg md:text-xl leading-relaxed font-normal"
            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We believe software should belong to the people who use it. Our mission
            is to help users discover open-source alternatives that prioritize
            freedom, privacy, transparency, and ownership.
          </motion.p>
        </div>
      </section>

      {/* Why We Exist / Mission Section */}
      <motion.section
        className="py-32 px-6 border-t border-outline-variant/10 relative"
        {...fadeInUp}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-10 tracking-tight">
            Why We Exist
          </h2>

          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-4xl mx-auto font-normal">
            The modern internet was built on openness. Over time, software became
            locked behind subscriptions, ecosystems became closed, and user data
            became a commodity.
            <br />
            <br />
            AI TOOL RESEARCH offers open source path — one built on trust, community collaboration,
            transparency, and genuine user ownership. We curate this shift.
          </p>
        </div>
      </motion.section>

      {/* Comparison Grid using brand-aligned .liquid-glass class */}
      <section className="py-32 px-6 border-t border-outline-variant/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">

            {/* Open Source Block */}
            <motion.div
              className="liquid-glass p-10 hover:-translate-y-2 transition-all duration-500 border border-primary/20 bg-primary/[0.01]"
              {...fadeInUp}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">lock_open</span>
                <h3 className="text-3xl font-bold text-white">Open Source</h3>
              </div>

              <div className="space-y-4 text-on-surface-variant text-base">
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> Transparent Code</p>
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> Community Driven</p>
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> Privacy Respecting</p>
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> Free To Use & Modify</p>
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> No Vendor Lock-In</p>
                <p className="flex items-center gap-3"><span className="text-primary font-bold text-lg">✓</span> User Ownership</p>
              </div>
            </motion.div>

            {/* Proprietary Block */}
            <motion.div
              className="liquid-glass p-10 hover:-translate-y-2 transition-all duration-500 border border-tertiary/10 bg-tertiary/[0.005]"
              {...fadeInUp}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-tertiary text-3xl">lock</span>
                <h3 className="text-3xl font-bold text-white opacity-85">Proprietary</h3>
              </div>

              <div className="space-y-4 text-on-surface-variant/60 text-base">
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Closed Black-Box Systems</p>
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Corporate First</p>
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Data Harvesting</p>
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Expensive Licensing</p>
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Vendor Lock-In</p>
                <p className="flex items-center gap-3"><span className="text-tertiary font-bold text-lg">✕</span> Limited Control</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Legends of Open Source timeline with interactive scroll nodes */}
      <section className="py-40 px-6 border-t border-outline-variant/10">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-center text-4xl md:text-6xl font-bold text-white mb-28 tracking-tight"
            {...fadeInUp}
          >
            Legends Of Open Source
          </motion.h2>

          <div className="relative">
            {/* Centered timeline gradient track */}
            <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-outline/30 to-transparent z-0" />

            {timelineItems.map((item, index) => (
              <motion.div
                key={item.title}
                className={`relative flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} mb-28 z-10`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
              >
                {/* Node with custom glow */}
                <div
                  className="absolute left-5 md:left-1/2 top-3 -translate-x-1/2 w-5 h-5 rounded-full z-20 border-4 border-[#0a0a0a]"
                  style={{
                    backgroundColor: `var(--color-${index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'tertiary'})`,
                    boxShadow: `0 0 25px ${item.glowColor}`
                  }}
                />

                <div className="pl-16 md:pl-0 md:w-1/2 md:px-12 text-left md:even:text-right">
                  <span className={`font-mono text-sm ${item.colorClass} font-semibold tracking-wider`}>
                    {item.year}
                  </span>

                  <h3 className="text-3xl font-bold text-white mt-2 mb-4">
                    {item.title}
                  </h3>

                  <p className="text-on-surface-variant leading-relaxed text-base">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs Section */}
      <BeliefsSection />

      {/* Dynamic Statistics Panel */}
      <section className="py-32 px-6 border-t border-outline-variant/10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <motion.div {...fadeInUp}>
            <h3 className="text-7xl font-black text-primary">500+</h3>
            <p className="text-on-surface-variant mt-4 text-sm font-mono tracking-widest uppercase">
              Open Source Tools
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <h3 className="text-7xl font-black text-secondary">100+</h3>
            <p className="text-on-surface-variant mt-4 text-sm font-mono tracking-widest uppercase">
              Categories Covered
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
            <h3 className="text-7xl font-black text-tertiary">∞</h3>
            <p className="text-on-surface-variant mt-4 text-sm font-mono tracking-widest uppercase">
              Possibilities Ahead
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Creators using the brand class .liquid-glass */}
      <section className="py-40 px-6 border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-center text-4xl md:text-6xl font-bold text-white mb-24 tracking-tight"
            {...fadeInUp}
          >
            Meet The Creators
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Chittresh",
                role: "Co-Founder & Developer",
                colorClass: "group-hover:border-primary/40",
                badgeClass: "text-primary"
              },
              {
                name: "Dhruv",
                role: "Co-Founder & Designer",
                colorClass: "group-hover:border-secondary/40",
                badgeClass: "text-secondary"
              },
              {
                name: "Aman",
                role: "Co-Founder & Architect",
                colorClass: "group-hover:border-tertiary/40",
                badgeClass: "text-tertiary"
              }
            ].map((member, i) => (
              <motion.div
                key={member.name}
                className="liquid-glass group p-10 hover:-translate-y-3 transition-all duration-500 flex flex-col justify-between"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div>
                  <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 border border-zinc-800 mb-8 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 group-hover:text-primary transition-colors">person</span>
                  </div>

                  <h3 className="text-center text-3xl font-bold text-white">
                    {member.name}
                  </h3>

                  <p className={`text-center font-mono text-xs tracking-wider uppercase mt-3 ${member.badgeClass}`}>
                    {member.role}
                  </p>

                  <p className="text-center text-on-surface-variant mt-6 leading-relaxed text-sm">
                    Passionate about building a future where technology empowers users through openness, transparency, and digital freedom.
                  </p>
                </div>

                <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-outline-variant/10">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-on-surface-variant hover:text-white hover:border-white transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-on-surface-variant hover:text-[#0077B5] hover:border-[#0077B5] transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect x={2} y={9} width={4} height={12} />
                      <circle cx={4} cy={4} r={2} />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic CTA Section with radial backdrop glow */}
      <section className="relative py-40 px-6 border-t border-outline-variant/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,206,255,0.08),transparent_70%)] pointer-events-none z-0" />

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <motion.h2
            className="text-5xl md:text-8xl font-black text-white leading-[1.05] tracking-tight mb-8"
            {...fadeInUp}
          >
            Ready To Leave
            <br />
            The Walled Gardens?
          </motion.h2>

          <motion.p
            className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-12"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Discover software that respects your privacy,
            values transparency, and gives you complete
            control over your digital life.
          </motion.p>

          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <Link href="/tools">
              <button className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold hover:scale-105 hover:bg-primary-fixed duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Explore Alternatives
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}