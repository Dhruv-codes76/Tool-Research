'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface ObsidianMascotProps {
  mouseX: number;
  mouseY: number;
  isPasswordFocused: boolean;
  isTyping: boolean;
}

/**
 * An SVG mascot character whose eyes follow the mouse cursor.
 * When the password field is focused, the character "covers its eyes" for privacy.
 */
export const ObsidianMascot: React.FC<ObsidianMascotProps> = ({
  mouseX,
  mouseY,
  isPasswordFocused,
  isTyping,
}) => {
  // Clamp eye movement to a small range (-8 to 8 pixels)
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const eyeOffsetX = clamp(mouseX * 8, -8, 8);
  const eyeOffsetY = clamp(mouseY * 6, -6, 6);

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Ambient glow behind character */}
        <defs>
          <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow circle */}
        <circle cx="140" cy="140" r="130" fill="url(#ambientGlow)" />

        {/* Body - rounded rectangle torso */}
        <motion.rect
          x="70" y="130" width="140" height="100" rx="30"
          fill="#201f1f"
          stroke="#464555"
          strokeWidth="1.5"
          animate={{ y: isTyping ? 132 : 130 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Head - large circle */}
        <motion.circle
          cx="140" cy="110" r="65"
          fill="#2a2a2a"
          stroke="#464555"
          strokeWidth="1.5"
          animate={{
            cy: isTyping ? 112 : 110,
            scale: isPasswordFocused ? 0.97 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />

        {/* Face detail - subtle inner circle */}
        <circle cx="140" cy="115" r="45" fill="#353534" opacity="0.4" />

        {/* LEFT EYE SOCKET */}
        <motion.ellipse
          cx="115" cy="105" rx="16" ry="18"
          fill="#131313"
          stroke="#4F46E5"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          animate={{
            ry: isPasswordFocused ? 2 : 18,
            cy: isPasswordFocused ? 108 : 105,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {/* LEFT PUPIL - follows mouse */}
        <motion.circle
          r="6"
          fill="#c3c0ff"
          filter="url(#softGlow)"
          animate={{
            cx: isPasswordFocused ? 115 : 115 + eyeOffsetX,
            cy: isPasswordFocused ? 108 : 105 + eyeOffsetY,
            opacity: isPasswordFocused ? 0 : 1,
            r: isTyping ? 7 : 6,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Left eye glint */}
        <motion.circle
          r="2"
          fill="#ffffff"
          animate={{
            cx: isPasswordFocused ? 115 : 112 + eyeOffsetX,
            cy: isPasswordFocused ? 108 : 100 + eyeOffsetY,
            opacity: isPasswordFocused ? 0 : 0.8,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* RIGHT EYE SOCKET */}
        <motion.ellipse
          cx="165" cy="105" rx="16" ry="18"
          fill="#131313"
          stroke="#4F46E5"
          strokeWidth="0.5"
          strokeOpacity="0.3"
          animate={{
            ry: isPasswordFocused ? 2 : 18,
            cy: isPasswordFocused ? 108 : 105,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />

        {/* RIGHT PUPIL - follows mouse */}
        <motion.circle
          r="6"
          fill="#c3c0ff"
          filter="url(#softGlow)"
          animate={{
            cx: isPasswordFocused ? 165 : 165 + eyeOffsetX,
            cy: isPasswordFocused ? 108 : 105 + eyeOffsetY,
            opacity: isPasswordFocused ? 0 : 1,
            r: isTyping ? 7 : 6,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        {/* Right eye glint */}
        <motion.circle
          r="2"
          fill="#ffffff"
          animate={{
            cx: isPasswordFocused ? 165 : 162 + eyeOffsetX,
            cy: isPasswordFocused ? 108 : 100 + eyeOffsetY,
            opacity: isPasswordFocused ? 0 : 0.8,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Mouth */}
        <motion.path
          d="M125 135 Q140 148 155 135"
          stroke="#c3c0ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: isPasswordFocused
              ? "M125 138 Q140 138 155 138"
              : isTyping
                ? "M128 135 Q140 145 152 135"
                : "M125 135 Q140 148 155 135",
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />

        {/* Password mode: Hands covering eyes */}
        <motion.rect
          x="90" y="90" width="30" height="20" rx="8"
          fill="#353534"
          stroke="#464555"
          strokeWidth="1"
          animate={{
            y: isPasswordFocused ? 96 : 180,
            opacity: isPasswordFocused ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
        <motion.rect
          x="160" y="90" width="30" height="20" rx="8"
          fill="#353534"
          stroke="#464555"
          strokeWidth="1"
          animate={{
            y: isPasswordFocused ? 96 : 180,
            opacity: isPasswordFocused ? 1 : 0,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />

        {/* Small antenna / detail on head */}
        <motion.line
          x1="140" y1="45" x2="140" y2="55"
          stroke="#4F46E5"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ y1: isTyping ? 43 : 45 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        <motion.circle
          cx="140" cy="42" r="4"
          fill="#4F46E5"
          animate={{ cy: isTyping ? 40 : 42, scale: isTyping ? 1.2 : 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />

        {/* Left arm */}
        <motion.path
          d="M75 160 Q55 175 60 200"
          stroke="#464555"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: isPasswordFocused
              ? "M75 150 Q70 130 95 100"
              : "M75 160 Q55 175 60 200",
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />

        {/* Right arm */}
        <motion.path
          d="M205 160 Q225 175 220 200"
          stroke="#464555"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: isPasswordFocused
              ? "M205 150 Q210 130 185 100"
              : "M205 160 Q225 175 220 200",
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      </svg>

      {/* Floating status text below character */}
      <motion.p
        className="absolute -bottom-2 text-xs font-medium tracking-wider uppercase"
        style={{ color: '#918fa1' }}
        animate={{
          opacity: isPasswordFocused ? 1 : 0.6,
        }}
      >
        {isPasswordFocused ? '🔒 Privacy Mode' : isTyping ? '👀 Watching...' : '✨ Hello there!'}
      </motion.p>
    </div>
  );
};
