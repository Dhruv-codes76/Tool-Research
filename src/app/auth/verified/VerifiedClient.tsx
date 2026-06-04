'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ObsidianMascot } from '@/components/auth/ObsidianMascot';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

type Phase = 'verifying' | 'success' | 'error';

// How long the "verifying" spinner stays before resolving — enough to read as
// real processing, short enough to not feel sluggish.
const PROCESSING_MS = 1100;
// How long the success tick lingers before sending the user to login.
const SUCCESS_HOLD_MS = 1600;

export default function VerifiedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error') !== null;

  const [phase, setPhase] = useState<Phase>('verifying');

  // Show the spinner briefly, then resolve to success/error.
  useEffect(() => {
    const timer = setTimeout(() => setPhase(hasError ? 'error' : 'success'), PROCESSING_MS);
    return () => clearTimeout(timer);
  }, [hasError]);

  // Once verified, hold the green tick for a beat, then go to login.
  useEffect(() => {
    if (phase !== 'success') return;
    const timer = setTimeout(() => router.push('/login?verified=true'), SUCCESS_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e0e0e] relative overflow-hidden">
      {/* Ambient background glow */}
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

        <AnimatePresence mode="wait">
          {phase === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-[#c3c0ff]" />
              <h1 className="text-2xl font-bold text-[#e5e2e1]">Verifying your email…</h1>
              <p className="text-[#918fa1] text-sm">Hang tight while we confirm your account.</p>
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <CheckCircle size={48} className="text-green-400" />
              </motion.div>
              <h1 className="text-3xl font-bold text-[#e5e2e1]">You&apos;re verified!</h1>
              <p className="text-[#918fa1] text-base">
                All set — your account is confirmed.
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-[#918fa1]/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to login…</span>
              </div>
            </motion.div>
          )}

          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <AlertTriangle size={44} className="text-amber-400" />
              <h1 className="text-2xl font-bold text-[#e5e2e1]">Verification failed</h1>
              <p className="text-[#918fa1] text-sm">
                This link may have expired or already been used. Try signing in, or request a new confirmation email.
              </p>
              <div className="flex flex-col gap-3 mt-2 w-full max-w-xs">
                <Link
                  href="/login"
                  className="bg-[#4F46E5] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#5B52F0] transition-colors"
                >
                  Go to Login
                </Link>
                <Link
                  href="/signup"
                  className="text-[#c3c0ff] hover:text-[#e2dfff] transition-colors text-xs font-semibold"
                >
                  Resend confirmation
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
