'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ResearchCycle = () => {
  const timelineItems = [
    {
      step: "01",
      title: "Discovery",
      desc: "We actively discover new tools by category, leveraging team recommendations, Reddit, Google searches, tech blogs, YouTube, Instagram, and TikTok.",
      colorClass: "text-primary",
      glowColor: "rgba(195, 192, 255, 0.7)",
      accentClass: "border-primary/20 bg-primary/[0.02]"
    },
    {
      step: "02",
      title: "Dig Deep Down",
      desc: "We dive into the community response by thoroughly analyzing reviews, discussions, and feedback across YouTube, Reddit, and various developer blogs.",
      colorClass: "text-secondary",
      glowColor: "rgba(137, 206, 255, 0.7)",
      accentClass: "border-secondary/20 bg-secondary/[0.02]"
    },
    {
      step: "03",
      title: "Testing",
      desc: "We personally use and test each tool to fully understand its capabilities, workflow, and real-world usefulness before it ever makes the cut.",
      colorClass: "text-tertiary",
      glowColor: "rgba(255, 182, 149, 0.7)",
      accentClass: "border-tertiary/20 bg-tertiary/[0.02]"
    },
    {
      step: "04",
      title: "Publish",
      desc: "Finally, we publish the tool to our index with a meticulously crafted description and verified, direct links.",
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
        <motion.div
          className="text-center mb-28"
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Our Research Cycle
          </h2>
          <p className="text-on-surface-variant text-lg font-medium tracking-wide uppercase font-mono">
            100% Curated & Tested by Humans
          </p>
        </motion.div>

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
                  STEP {item.step}
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
