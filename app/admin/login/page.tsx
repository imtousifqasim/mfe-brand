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
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative z-10 text-slate-900">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-3">
          <img src="/logo.png" alt="MFE BRAND" className="h-20 w-auto mx-auto object-contain" />
        </Link>
        <p className="text-[11px] font-sans font-bold tracking-[0.25em] uppercase text-amber-700">
          Administration Portal
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {step === 'credentials'
            ? 'Strictly restricted administrative access. Authenticate to proceed.'
            : 'Two-Factor Authentication required. Enter the code from your Authenticator app.'}
        </p>
      </div>

      {/* Error / Alert Banner */}
      {error && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
          isLocked 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold">{error}</p>
            {isLocked && lockCountdown !== null && (
              <p className="text-[11px] font-mono font-bold text-rose-700">
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
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs disabled:opacity-50"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700">
                  Administrative Secret Key
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[10px] font-bold text-amber-700 hover:text-amber-800 transition uppercase tracking-wider"
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
                  className="w-full pl-10 pr-11 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isLocked ? (
                <span>Security Lockout Active</span>
              ) : (
                <>
                  <span>Authorize & Enter</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </>
        ) : (
          /* Step 2: Two-Factor Authenticator Code */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3 font-medium">
              <Smartphone className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Enter the 6-digit verification code from Google Authenticator or your 2FA app.</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 text-center tracking-[0.4em] font-mono text-lg font-bold bg-white border border-slate-200 rounded-xl text-amber-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs disabled:opacity-50"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked || totpCode.length !== 6}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying 2FA Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code & Enter</span>
                  <ArrowRight className="w-4 h-4 text-white" />
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
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-900 transition text-center font-semibold cursor-pointer"
            >
              ← Back to Username & Password
            </button>
          </div>
        )}
      </form>

      {/* Return to Storefront */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>

        <Link
          href="/admin/forgot-password"
          className="font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          Password Recovery
        </Link>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-slate-200/50 blur-[100px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="text-center text-slate-500 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span>Loading secure portal...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
