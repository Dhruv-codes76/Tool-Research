'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const ScrollFadeSection = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
      // By omitting `once: true`, the animation will re-trigger both when scrolling down and up.
      viewport={{ amount: "some", margin: "-15% 0px -15% 0px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
