'use client';

import React, { useState } from 'react';

interface AboutSectionProps {
  aboutText: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ aboutText }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const wordCount = aboutText.split(/\s+/).length;
  const isLong = wordCount > 70;

  return (
    <section className="space-y-3">
      <h2 className="font-headline-md text-xl md:text-2xl text-on-surface">
        About
      </h2>
      <div className="relative">
        <div 
          className={`text-on-surface-variant text-sm md:text-base leading-relaxed whitespace-pre-line transition-all duration-500 ease-in-out relative ${
            isExpanded ? 'pb-12' : (isLong ? 'max-h-[140px] overflow-hidden' : '')
          }`}
        >
          {aboutText}
          
          {/* Translucent Fading Gradient Overlay */}
          {!isExpanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />
          )}
        </div>
        
        {/* Toggle Button */}
        {isLong && (
          <div className={isExpanded ? 'mt-3' : 'absolute bottom-1 left-0 z-10'}>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 text-primary/80 hover:text-primary transition-all duration-300 font-semibold text-xs cursor-pointer py-1 bg-transparent border-0 outline-none focus:outline-none"
            >
              <span>{isExpanded ? 'View Less' : 'View More'}</span>
              <span className="material-symbols-outlined text-sm">
                {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
