'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    id: 1,
    question: "Is this platform completely free to use?",
    answer: "Yes, our platform is 100% free. We believe in open-source principles and ensuring that developers and users can find the best tools without any paywalls or hidden fees."
  },
  {
    id: 2,
    question: "How do you verify the tools submitted?",
    answer: "Every submission goes through our rigorous human-curated research cycle. We test the tool, check community reviews on Reddit and YouTube, and verify its open-source status before publishing."
  },
  {
    id: 3,
    question: "Can I submit my own open-source tool?",
    answer: "Absolutely! Just log in, click 'Submit a Tool', and fill in the details. Once submitted, our team will review and publish it if it meets our community guidelines and provides genuine value."
  },
  {
    id: 4,
    question: "How often is the database updated?",
    answer: "We update our database continuously. Our team constantly monitors GitHub, tech blogs, and community forums to discover and add the latest open-source excellence."
  }
];

export const SlidingSearchFaq = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const nextFaq = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % faqs.length);
  };

  const prevFaq = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + faqs.length) % faqs.length);
  };

  // Optional: Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      nextFaq();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      filter: "blur(4px)"
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)"
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      filter: "blur(4px)"
    })
  };

  return (
    <section className="py-32 px-6 border-t border-outline-variant/10 relative overflow-hidden bg-surface-container-lowest/30">
      <div className="max-w-4xl mx-auto relative z-10">
        
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Frequently Searched
          </h2>
          <p className="text-on-surface-variant font-mono uppercase text-sm tracking-widest">
            Answers to your top questions
          </p>
        </motion.div>

        {/* The Search UI Container */}
        <div className="flex flex-col items-center w-full">
          
          {/* Google-style Search Bar Container */}
          <div className="w-full max-w-2xl relative">
            {/* Flowing liquid light glow behind the bar */}
            <div
              aria-hidden
              className="glow-flow pointer-events-none absolute -inset-[2px] rounded-full opacity-80"
            />
            
            <div className="relative z-10 flex items-center bg-[#1a1a1a] border border-outline-variant/20 rounded-full px-6 py-4 shadow-[0_0_55px_-8px_rgba(79,70,229,0.55)] hover:shadow-[0_0_65px_-8px_rgba(79,70,229,0.7)] hover:border-primary/50 transition-all duration-300">
              
              {/* Google-style Search Icon */}
              <span className="material-symbols-outlined text-on-surface-variant mr-4 text-[22px]">
                search
              </span>

              {/* Sliding Question */}
              <div className="flex-grow overflow-hidden relative h-7 flex items-center">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute w-full text-white text-lg truncate font-medium"
                  >
                    {faqs[activeIndex].question}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Controls / End icons */}
              <div className="flex items-center gap-3 ml-4">
                <button 
                  onClick={prevFaq}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-outline-variant/20 transition-colors"
                  aria-label="Previous question"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button 
                  onClick={nextFaq}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-outline-variant/20 transition-colors"
                  aria-label="Next question"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search Result / Answer Box */}
          <div className="w-full max-w-2xl mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="px-6 md:px-8 pt-6 pb-2 relative"
              >
                {/* Result metadata mimicking a search engine removed per user request */}
                
                <p className="text-on-surface-variant text-base md:text-lg leading-relaxed text-center">
                  {faqs[activeIndex].answer}
                </p>
                
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {faqs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeIndex ? 1 : -1);
                  setActiveIndex(idx);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? "bg-primary w-6" 
                    : "bg-outline-variant/30 hover:bg-outline-variant/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
