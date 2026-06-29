'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const LegendsOfOpenSource = () => {
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

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  } as const;

  return (
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
  );
};
