'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const HowToContribute = () => {
  const steps = [
    {
      id: "01",
      title: "Found a Tool?",
      desc: "Want to support a developer to get more visibility, or help people discover a hidden open-source gem?",
      icon: "search",
      colorClass: "text-primary",
      bgClass: "bg-primary/[0.02]",
      borderClass: "border-primary/20",
      iconBg: "bg-primary/10"
    },
    {
      id: "02",
      title: "Login & Submit",
      desc: "As a logged-in user, you can easily submit a tool. Every submission helps our open-source community grow.",
      icon: "login",
      colorClass: "text-secondary",
      bgClass: "bg-secondary/[0.02]",
      borderClass: "border-secondary/20",
      iconBg: "bg-secondary/10"
    },
    {
      id: "03",
      title: "We Review",
      desc: "Our team takes over and puts the submitted tool through our rigorous, human-driven research cycle.",
      icon: "verified",
      colorClass: "text-tertiary",
      bgClass: "bg-tertiary/[0.02]",
      borderClass: "border-tertiary/20",
      iconBg: "bg-tertiary/10"
    },
    {
      id: "04",
      title: "Published!",
      desc: "You rocked and contributed! The tool goes live, providing genuine human-curated value to everyone.",
      icon: "rocket_launch",
      colorClass: "text-primary-fixed-dim",
      bgClass: "bg-primary-fixed/[0.02]",
      borderClass: "border-primary-fixed/20",
      iconBg: "bg-primary-fixed/10"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  } as const;

  return (
    <section className="py-32 px-6 border-t border-outline-variant/10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(195,192,255,0.05),transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-20"
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Contribute to the Platform
          </h2>
          <p className="text-on-surface-variant text-lg font-medium tracking-wide uppercase font-mono">
            By the People, For the People
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`liquid-glass p-8 rounded-3xl border ${step.borderClass} ${step.bgClass} hover:-translate-y-2 transition-transform duration-500 flex flex-col h-full`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-full ${step.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${step.colorClass}`}>
                    {step.icon}
                  </span>
                </div>
                <span className={`font-mono text-2xl font-black opacity-30 ${step.colorClass}`}>
                  {step.id}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title}
              </h3>
              
              <p className="text-on-surface-variant leading-relaxed text-sm flex-grow">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/tools/submit">
            <button className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold hover:bg-primary-fixed shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300">
              Submit a Tool Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
