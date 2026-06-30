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
      glowColor: "rgba(195, 192, 255, 0.7)",
      bgClass: "bg-primary/[0.03]",
      borderClass: "border-primary/20",
    },
    {
      id: "02",
      title: "Login & Submit",
      desc: "As a logged-in user, you can easily submit a tool. Every submission helps our open-source community grow.",
      icon: "login",
      colorClass: "text-secondary",
      glowColor: "rgba(137, 206, 255, 0.7)",
      bgClass: "bg-secondary/[0.03]",
      borderClass: "border-secondary/20",
    },
    {
      id: "03",
      title: "We Review",
      desc: "Our team takes over and puts the submitted tool through our rigorous, human-driven research cycle.",
      icon: "verified",
      colorClass: "text-tertiary",
      glowColor: "rgba(255, 182, 149, 0.7)",
      bgClass: "bg-tertiary/[0.03]",
      borderClass: "border-tertiary/20",
    },
    {
      id: "04",
      title: "Published!",
      desc: "You rocked and contributed! The tool goes live, providing genuine human-curated value to everyone.",
      icon: "rocket_launch",
      colorClass: "text-primary-fixed-dim",
      glowColor: "rgba(195, 192, 255, 0.7)",
      bgClass: "bg-primary-fixed/[0.03]",
      borderClass: "border-primary-fixed/20",
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
          className="text-center mb-32"
          {...fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            Contribute to the Platform
          </h2>
          <p className="text-on-surface-variant text-lg font-medium tracking-wide uppercase font-mono">
            By the People, For the People
          </p>
        </motion.div>

        {/* The Sacred Line container */}
        <div className="relative pt-10 pb-10 md:pt-40 md:pb-40">
          {/* Desktop Horizontal Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent -translate-y-1/2 rounded-full overflow-hidden">
            {/* Traveling Light Beam */}
            <motion.div 
              className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ left: ["-20%", "120%"] }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
          </div>

          {/* Mobile Vertical Line */}
          <div className="md:hidden absolute left-[31px] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-outline-variant/40 to-transparent rounded-full overflow-hidden">
             <motion.div 
              className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-primary to-transparent"
              animate={{ top: ["-20%", "120%"] }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
            {steps.map((step, index) => {
              const isTop = index % 2 === 0;

              return (
                <div key={step.id} className="relative flex md:flex-col items-center md:items-center">
                  
                  {/* Content Container (Mobile: Right of line, Desktop: Alternating Top/Bottom) */}
                  <motion.div 
                    className={`ml-16 md:ml-0 md:absolute md:w-[120%] lg:w-[140%] ${isTop ? 'md:bottom-16' : 'md:top-16'} group`}
                    initial={{ opacity: 0, y: isTop ? -30 : 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="relative hover:-translate-y-2 transition-transform duration-500 rounded-3xl p-[1px] group">
                      {/* Synchronized Glowing Border & Outer Shadow */}
                      <motion.div
                        className="absolute inset-0 rounded-3xl z-0"
                        animate={{
                          background: [
                            'rgba(255,255,255,0.05)', 
                            'rgba(255,255,255,0.05)', 
                            step.glowColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgba($1, 1)'), 
                            'rgba(255,255,255,0.05)', 
                            'rgba(255,255,255,0.05)'
                          ],
                          boxShadow: [
                            '0 0 0px transparent', 
                            '0 0 0px transparent', 
                            `0 0 50px 10px ${step.glowColor}`, 
                            '0 0 0px transparent', 
                            '0 0 0px transparent'
                          ],
                        }}
                        transition={{
                          duration: 10,
                          times: [
                            0, 
                            ((12.5 + index * 25) + 20) / 140 - 0.05, 
                            ((12.5 + index * 25) + 20) / 140, 
                            ((12.5 + index * 25) + 20) / 140 + 0.1, 
                            1
                          ],
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      
                      {/* Fully opaque inner card to mask the center */}
                      <div className={`relative h-full p-8 rounded-[calc(1.5rem-1px)] border border-white/5 !bg-[#0A0A0A] overflow-hidden z-10`}>
                        {/* Giant background number */}
                        <span className={`absolute -bottom-4 -right-4 font-mono text-9xl font-black opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 ${step.colorClass}`}>
                          {step.id}
                        </span>

                        <div className="relative z-10 flex flex-col items-start text-left">
                          <span className={`font-mono text-sm ${step.colorClass} font-semibold tracking-wider mb-2`}>
                            STEP {step.id}
                          </span>
                          <h3 className="text-2xl font-bold text-white mb-3">
                            {step.title}
                          </h3>
                          <p className="text-on-surface-variant leading-relaxed text-sm">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Sacred Node on the line */}
                  <motion.div 
                    className="absolute left-[31px] md:static md:left-auto md:top-auto w-6 h-6 z-20 md:my-0 transform -translate-x-1/2 md:translate-x-0 group"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 + (index * 0.1) }}
                  >
                    <motion.div
                      className="w-full h-full rounded-full border-4 border-[#0a0a0a] flex items-center justify-center relative"
                      style={{
                        backgroundColor: '#333', // Default dimmed state
                      }}
                      animate={{
                        backgroundColor: [
                          '#333', 
                          '#333',
                          step.glowColor.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, 'rgb($1)'), 
                          '#333', 
                          '#333'
                        ],
                        boxShadow: [
                          '0 0 0px transparent', 
                          '0 0 0px transparent', 
                          `0 0 30px 5px ${step.glowColor}`, 
                          '0 0 0px transparent', 
                          '0 0 0px transparent'
                        ],
                      }}
                      transition={{
                        duration: 10,
                        times: [
                          0, 
                          ((12.5 + index * 25) + 20) / 140 - 0.05, 
                          ((12.5 + index * 25) + 20) / 140, 
                          ((12.5 + index * 25) + 20) / 140 + 0.1, 
                          1
                        ],
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                       {/* Outer synced burst ring */}
                       <motion.div
                         className="absolute inset-0 rounded-full"
                         style={{ border: `2px solid ${step.glowColor}` }}
                         animate={{ scale: [1, 1, 2.5, 1, 1], opacity: [0, 0, 1, 0, 0] }}
                         transition={{ 
                           duration: 10, 
                           times: [
                            0, 
                            ((12.5 + index * 25) + 20) / 140 - 0.05, 
                            ((12.5 + index * 25) + 20) / 140, 
                            ((12.5 + index * 25) + 20) / 140 + 0.1, 
                            1
                           ],
                           repeat: Infinity, 
                           ease: "easeOut", 
                         }}
                       />
                    </motion.div>
                  </motion.div>

                  {/* Connecting dashed line to card on Desktop */}
                  <div className={`hidden md:block absolute w-px border-l-2 border-dashed border-outline-variant/30 left-1/2 -translate-x-1/2 z-0 ${isTop ? 'bottom-3 h-12' : 'top-3 h-12'}`} />

                </div>
              );
            })}
          </div>
        </div>

        <motion.div 
          className="mt-20 md:mt-32 text-center relative z-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/tools/submit">
            <button className="group px-8 py-4 rounded-full bg-primary text-on-primary font-bold hover:bg-primary-fixed shadow-[0_0_30px_rgba(195,192,255,0.3)] hover:shadow-[0_0_50px_rgba(195,192,255,0.5)] hover:scale-105 transition-all duration-300">
              Submit a Tool Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
