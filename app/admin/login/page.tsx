'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  KeyRound,
  Smartphone
} from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);

  // Handle lockout countdown timer
  useEffect(() => {
    if (!lockCountdown || lockCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockCountdown((prev) => {
        if (prev && prev > 1) return prev - 1;
        setIsLocked(false);
        setError(null);
        return null;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    setLoading(true);

    try {
      const payload: { username: string; password: string; totpCode?: string } = {
        username: username.trim(),
        password,
      };

      if (step === '2fa') {
        payload.totpCode = totpCode.trim();
      }

      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setIsLocked(true);
          setLockCountdown(data.lockoutRemainingSec || 900);
        }
        setError(data.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      // Check if 2FA code is needed
      if (data.require2FA) {
        setStep('2fa');
        setLoading(false);
        return;
      }

      // Success -> Redirect to intended admin page
      router.replace(redirectTarget);
      router.refresh();
    } catch {
      setError('A connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl relative z-10">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-[0.2em] uppercase text-white">
          MFE BRAND
        </h1>
        <p className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-amber-400 mt-1">
          Haute Couture • Control Center
        </p>
        <p className="text-xs text-slate-400 mt-2">
          {step === 'credentials'
            ? 'Strictly restricted administrative access. Authenticate to proceed.'
            : 'Two-Factor Authentication required. Enter the code from your Authenticator app.'}
        </p>
      </div>

      {/* Error / Alert Banner */}
      {error && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          isLocked 
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-300' 
            : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            {isLocked && lockCountdown !== null && (
              <p className="text-[11px] font-mono font-bold text-rose-400">
                Lockout active: {formatCountdown(lockCountdown)} remaining
              </p>
            )}
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 'credentials' ? (
          <>
            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-2">
                Administrator Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={loading || isLocked}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300">
                  Administrative Secret Key
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition uppercase tracking-wider"
                >
                  Forgot Key?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading || isLocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrative password"
                  className="w-full pl-10 pr-11 py-3 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isLocked ? (
                <span>Security Lockout Active</span>
              ) : (
                <>
                  <span>Authorize & Enter</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </>
        ) : (
          /* Step 2: Two-Factor Authenticator Code */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Enter the 6-digit verification code from Google Authenticator or your 2FA app.</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-300 mb-2">
                6-Digit Authenticator Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  disabled={loading || isLocked}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono text-lg font-bold bg-slate-950/80 border border-slate-800 rounded-xl text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked || totpCode.length !== 6}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying 2FA Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Enter</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setTotpCode('');
                setError(null);
              }}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition text-center font-medium"
            >
              ← Back to Username & Password
            </button>
          </div>
        )}
      </form>

      {/* Return to Storefront */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 text-center flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-400 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>

        <Link
          href="/admin/forgot-password"
          className="font-semibold text-slate-400 hover:text-amber-400 transition"
        >
          Password Recovery
        </Link>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-slate-800/20 blur-[100px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="text-center text-slate-400 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading secure portal...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
