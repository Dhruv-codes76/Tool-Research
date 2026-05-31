'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ObsidianMascot } from '@/components/auth/ObsidianMascot';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after 4 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e0e0e] relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4F46E5] rounded-full opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#89ceff] rounded-full opacity-[0.03] blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-8 z-10 max-w-md text-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <ObsidianMascot mouseX={0} mouseY={0} isPasswordFocused={false} isTyping={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={24} />
            <h1 className="text-3xl font-bold text-[#e5e2e1]">Account Verified!</h1>
          </div>
          
          <p className="text-[#918fa1] text-base">
            Your email has been successfully confirmed. Welcome to the premium vault of open-source tools.
          </p>

          <div className="flex items-center gap-2 mt-4 text-sm text-[#918fa1]/70">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecting to the website...</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
