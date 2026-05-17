'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ObsidianMascot } from './ObsidianMascot';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);


interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'update-password';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams?.get('verified');

  useEffect(() => {
    if (verified === 'true') {
      setError('Your account has been successfully verified! You can now log in.');
    }
  }, [verified]);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track mouse position relative to the container center (normalized -1 to 1)
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMousePos({
      x: (e.clientX - centerX) / (rect.width / 2),
      y: (e.clientY - centerY) / (rect.height / 2),
    });
  }, []);

  // Detect typing activity
  const handleKeyDown = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 500);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address above to resend confirmation.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        },
      });
      if (error) throw error;
      setError('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/');
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setError('Password reset link sent! Check your email.');
      } else if (isUpdatePassword) {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });
        if (error) throw error;
        setError('Password updated successfully! Redirecting...');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/login?verified=true')}`,
          },
        });
        if (error) throw error;
        setError('Confirmation email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isForgotPassword = mode === 'forgot-password';
  const isUpdatePassword = mode === 'update-password';
  const isSignup = mode === 'signup';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex bg-[#0e0e0e] relative overflow-hidden"
    >
      {/* Ambient background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#4F46E5] rounded-full opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#89ceff] rounded-full opacity-[0.03] blur-[100px]" />
      </div>

      {/* LEFT PANEL — Interactive Character Stage */}
      <motion.div
        className="hidden lg:flex w-1/2 items-center justify-center relative"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(195, 192, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(195, 192, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="flex flex-col items-center gap-8 z-10">
          <ObsidianMascot
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            isPasswordFocused={isPasswordFocused}
            isTyping={isTyping}
          />
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-[#e5e2e1] mb-2">
              {isLogin
                ? 'Welcome Back'
                : isForgotPassword
                  ? 'Reset Password'
                  : isUpdatePassword
                    ? 'Security First'
                    : 'Join the Vault'}
            </h2>
            <p className="text-sm text-[#918fa1] max-w-xs">
              {isLogin
                ? 'Your curated open-source tools await.'
                : isForgotPassword
                  ? 'Don\'t worry, we\'ll help you get back in.'
                  : isUpdatePassword
                    ? 'Choose a strong new password to protect your account.'
                    : 'Start discovering and curating premium open-source tools.'}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT PANEL — Glassmorphic Auth Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile-only mascot (smaller) */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="scale-75">
              <ObsidianMascot
                mouseX={mousePos.x}
                mouseY={mousePos.y}
                isPasswordFocused={isPasswordFocused}
                isTyping={isTyping}
              />
            </div>
          </div>

          {/* Form Card */}
          <motion.div
            className="rounded-2xl p-8 sm:p-10 border border-[#464555]/30"
            style={{
              background: 'rgba(32, 31, 31, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#e5e2e1] mb-2">
                {isLogin
                  ? 'Sign In'
                  : isForgotPassword
                    ? 'Forgot Password'
                    : isUpdatePassword
                      ? 'Update Password'
                      : 'Create Account'}
              </h1>
              <p className="text-sm text-[#918fa1]">
                {isLogin
                  ? 'Enter your credentials to access the admin panel.'
                  : isForgotPassword
                    ? 'Enter your email and we\'ll send you a link to reset.'
                    : isUpdatePassword
                      ? 'Enter your new secure password below.'
                      : 'Fill in your details to get started.'}
              </p>
            </div>

            {/* GitHub OAuth Button */}
            {!isForgotPassword && !isUpdatePassword && (
              <>
                <motion.button
                  type="button"
                  onClick={handleGitHubLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
                             border border-[#464555]/50 bg-[#1c1b1b] text-[#e5e2e1] text-sm font-medium
                             hover:bg-[#2a2a2a] hover:border-[#464555] transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon />}
                  Continue with GitHub
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-[#464555]/40" />
                  <span className="text-xs text-[#918fa1] uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-[#464555]/40" />
                </div>
              </>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-xs border ${error.includes('Confirmation') || error.includes('sent')
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                >
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <AnimatePresence>
                {!isLogin && !isForgotPassword && !isUpdatePassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Full Name */}
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]"
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        required={!isLogin}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#131313] border border-[#464555]/30
                                   text-[#e5e2e1] text-sm placeholder-[#918fa1]/60
                                   focus:outline-none focus:border-[#4F46E5]/60 focus:ring-1 focus:ring-[#4F46E5]/20
                                   transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              {!isUpdatePassword && (
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#131313] border border-[#464555]/30
                               text-[#e5e2e1] text-sm placeholder-[#918fa1]/60
                               focus:outline-none focus:border-[#4F46E5]/60 focus:ring-1 focus:ring-[#4F46E5]/20
                               transition-all duration-200"
                  />
                </div>
              )}

              {/* Password */}
              {!isForgotPassword && (
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isUpdatePassword ? "New Password" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onKeyDown={handleKeyDown}
                    required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-[#131313] border border-[#464555]/30
                               text-[#e5e2e1] text-sm placeholder-[#918fa1]/60
                               focus:outline-none focus:border-[#4F46E5]/60 focus:ring-1 focus:ring-[#4F46E5]/20
                               transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#918fa1] hover:text-[#c3c0ff] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {/* Confirm Password (signup only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]"
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#131313] border border-[#464555]/30
                                 text-[#e5e2e1] text-sm placeholder-[#918fa1]/60
                                 focus:outline-none focus:border-[#4F46E5]/60 focus:ring-1 focus:ring-[#4F46E5]/20
                                 transition-all duration-200"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember me / Forgot password (login only) */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-[#918fa1] cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-[#464555] bg-[#131313] text-[#4F46E5]
                                 focus:ring-[#4F46E5]/30 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="group-hover:text-[#c7c4d8] transition-colors">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#c3c0ff] hover:text-[#e2dfff] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl
                           bg-[#4F46E5] text-white text-sm font-semibold
                           hover:bg-[#5B52F0] transition-all duration-200
                           shadow-lg shadow-[#4F46E5]/20
                           disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(79, 70, 229, 0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin
                      ? 'Sign In'
                      : isForgotPassword
                        ? 'Send Reset Link'
                        : isUpdatePassword
                          ? 'Update Password'
                          : 'Create Account'}
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer link */}
            <div className="text-center text-sm text-[#918fa1] mt-6 flex flex-col gap-2">
              {isLogin ? (
                <>
                  <span>
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-[#c3c0ff] hover:text-[#e2dfff] font-medium transition-colors">
                      Sign Up
                    </Link>
                  </span>
                  <span>
                    Didn&apos;t receive confirmation?{' '}
                    <button type="button" onClick={handleResendEmail} className="text-[#c3c0ff] hover:text-[#e2dfff] font-medium transition-colors cursor-pointer">
                      Resend Email
                    </button>
                  </span>
                </>
              ) : isForgotPassword || isUpdatePassword ? (
                <>
                  Back to{' '}
                  <Link href="/login" className="text-[#c3c0ff] hover:text-[#e2dfff] font-medium transition-colors">
                    Sign In
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#c3c0ff] hover:text-[#e2dfff] font-medium transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Terms text */}
          <p className="text-center text-xs text-[#918fa1]/50 mt-6 max-w-sm mx-auto">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
