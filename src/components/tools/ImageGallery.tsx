"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ImageGallery({ images, imageRatio, toolName }: { images: string[], imageRatio: string, toolName: string }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
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
              onClick={() => setSelectedImage(imgUrl)}
              className={`rounded-xl overflow-hidden border border-outline-variant/30 relative group cursor-zoom-in transition-all duration-500 ${
                imageRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-square'
              }`}
            >
              <img 
                alt={`${toolName} preview ${i + 1}`}
                src={processedImgUrl}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">zoom_in</span>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors z-10 focus:outline-none flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedImage}
              alt={`${toolName} preview (enlarged)`}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
