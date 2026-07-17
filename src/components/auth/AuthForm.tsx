'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ObsidianMascot } from './ObsidianMascot';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { acceptInvite } from '@/app/actions/adminManagementActions';
import { logAuthEvent } from '@/app/actions/auditActions';
import { useRouter, useSearchParams } from 'next/navigation';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'update-password' | 'accept-invite';
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

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    verified === 'true' ? 'Your account has been successfully verified! You can now log in.' : null
  );

  useEffect(() => {
    if (mode === 'update-password' || mode === 'accept-invite') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError(
            mode === 'accept-invite'
              ? 'This invite link is invalid or has expired. Please ask an admin to re-send it.'
              : 'You must be logged in to update your password or use the link from your email.'
          );
          setTimeout(() => router.push('/login'), 3000);
        }
      });
    }
  }, [mode, router]);


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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGoogleLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGithubLoading(false);
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/verified`,
        },
      });
      if (error) throw error;
      setError(`Confirmation email resent to ${email}! Please check your inbox.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isForgotPassword && password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if ((isSignup || isUpdatePassword || isAcceptInvite) && password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Record the sign-in first: a hard navigation (below) cancels in-flight
        // fetches, so await the audit call instead of firing-and-forgetting it.
        // It never throws (best-effort).
        await logAuthEvent('auth.login', data.session?.access_token).catch(() => {});
        // Full-page navigation — NOT router.push()+refresh(). signInWithPassword
        // has just written the Supabase auth cookies; a soft RSC refresh can race
        // that write and re-render the server as logged-out, which is exactly why
        // login used to need two attempts. A real navigation guarantees the
        // browser sends the fresh cookies, so the first attempt sticks. Honors the
        // ?next= param (e.g. an admin bounced from /login?next=/admin) while
        // rejecting open-redirects to external URLs.
        const nextParam = searchParams?.get('next');
        const dest =
          nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
            ? nextParam
            : '/';
        window.location.assign(dest);
        return;
      } else if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setError('Password reset link sent! Check your email.');
      } else if (isUpdatePassword || isAcceptInvite) {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });
        if (error) throw error;
        if (isAcceptInvite) {
          // Promote the pending invite to an active admin, then enter the panel.
          await acceptInvite();
          setError('Account activated! Redirecting to the admin panel...');
          setTimeout(() => { router.push('/admin'); router.refresh(); }, 1500);
        } else {
          setError('Password updated successfully! Redirecting...');
          setTimeout(() => { router.push('/login'); router.refresh(); }, 2000);
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/auth/verified')}`,
          },
        });
        if (error) throw error;
        setError(`Confirmation email sent to ${email}! Please check your inbox.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isForgotPassword = mode === 'forgot-password';
  const isUpdatePassword = mode === 'update-password';
  const isSignup = mode === 'signup';
  const isAcceptInvite = mode === 'accept-invite';

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
                    : isAcceptInvite
                      ? 'Accept Your Invite'
                      : 'Join the Vault'}
            </h2>
            <p className="text-sm text-[#918fa1] max-w-xs">
              {isLogin
                ? 'Your curated open-source tools await.'
                : isForgotPassword
                  ? 'Don\'t worry, we\'ll help you get back in.'
                  : isUpdatePassword
                    ? 'Choose a strong new password to protect your account.'
                    : isAcceptInvite
                      ? 'Set a password to activate your admin account.'
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
                      : isAcceptInvite
                        ? 'Activate Account'
                        : 'Create Account'}
              </h1>
              <p className="text-sm text-[#918fa1]">
                {isLogin
                  ? 'Enter your credentials to access the admin panel.'
                  : isForgotPassword
                    ? 'Enter your email and we\'ll send you a link to reset.'
                    : isUpdatePassword
                      ? 'Enter your new secure password below.'
                      : isAcceptInvite
                        ? 'Choose a password to finish setting up your admin access.'
                        : 'Fill in your details to get started.'}
              </p>
            </div>

            {/* OAuth Buttons */}
            {!isForgotPassword && !isUpdatePassword && !isAcceptInvite && (
              <>
                <div className="flex flex-col gap-3">
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || githubLoading || googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
                               border border-[#464555]/50 bg-[#1c1b1b] text-[#e5e2e1] text-sm font-medium
                               hover:bg-[#2a2a2a] hover:border-[#464555] transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                    Continue with Google
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={loading || githubLoading || googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl
                               border border-[#464555]/50 bg-[#1c1b1b] text-[#e5e2e1] text-sm font-medium
                               hover:bg-[#2a2a2a] hover:border-[#464555] transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GithubIcon />}
                    Continue with GitHub
                  </motion.button>
                </div>

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
                  className={`mb-6 p-3 rounded-lg flex items-start gap-3 text-sm border ${error.includes('Confirmation') || error.includes('sent')
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{error}</span>
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
              {!isUpdatePassword && !isAcceptInvite && (
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
                    placeholder={isUpdatePassword || isAcceptInvite ? "New Password" : "Password"}
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

              {/* Confirm Password (signup, update-password, accept-invite) */}
              <AnimatePresence>
                {(isSignup || isUpdatePassword || isAcceptInvite) && (
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
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onKeyDown={handleKeyDown}
                      required
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
                disabled={loading || githubLoading || googleLoading}
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
                          : isAcceptInvite
                            ? 'Activate Account'
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
              ) : isForgotPassword || isUpdatePassword || isAcceptInvite ? (
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

            {/* ── DEV BYPASS ── only visible in development ── */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-5 border-t border-dashed border-[#464555]/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded px-1.5 py-0.5">
                    DEV
                  </span>
                  <span className="text-xs text-[#918fa1]">Quick login — dev only, never in production</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href="/api/dev-login?role=admin"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
                               border border-orange-400/30 bg-orange-400/5 text-orange-400 text-xs font-medium
                               hover:bg-orange-400/10 hover:border-orange-400/50 transition-all duration-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Login as Admin
                  </a>
                  <a
                    href="/api/dev-login?role=user"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
                               border border-sky-400/30 bg-sky-400/5 text-sky-400 text-xs font-medium
                               hover:bg-sky-400/10 hover:border-sky-400/50 transition-all duration-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Login as User
                  </a>
                </div>
              </div>
            )}
            {/* ── END DEV BYPASS ── */}
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