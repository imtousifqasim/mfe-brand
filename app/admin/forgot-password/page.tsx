'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: usernameOrEmail.trim() }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Failed to initiate recovery.');
        return;
      }

      if (data.resetCode) {
        setGeneratedCode(data.resetCode);
        setResetCode(data.resetCode);
      }

      setMessage('Password reset token generated. Enter your new administrative secret key below.');
      setStep('reset');
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resetCode: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        return;
      }

      setStep('success');
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const copyResetCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative z-10 text-slate-900">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mb-4 shadow-2xs">
            <KeyRound className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-[0.2em] uppercase text-slate-900">
            Administrative Recovery
          </h1>
          <p className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-amber-700 mt-1">
            MFE Brand • Security Vault
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Self-service credential recovery for authorized administrators.
          </p>
        </div>

        {/* Error / Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {message && step === 'reset' && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Generated Code Display Pill */}
        {generatedCode && step === 'reset' && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">
              Administrative Verification Code:
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-black text-amber-900 tracking-[0.3em]">
                {generatedCode}
              </span>
              <button
                type="button"
                onClick={copyResetCode}
                className="p-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                title="Copy Code"
              >
                {codeCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-amber-700">
              Valid for 60 minutes across both database shards.
            </p>
          </div>
        )}

        {/* STEP 1: Request Code Form */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-2">
                Administrator Username or Email
              </label>
              <input
                type="text"
                required
                autoFocus
                disabled={loading}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="e.g. mfe_admin or admin@mfebrand.com"
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !usernameOrEmail.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Verification Token...</span>
                </>
              ) : (
                <span>Request Recovery Code</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Reset Password Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 text-center tracking-[0.25em] font-mono text-base bg-white border border-slate-200 rounded-xl text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-1.5">
                New Administrative Secret Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-4 pr-10 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-700 mb-1.5">
                Confirm Secret Key
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter secret key"
                className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !resetCode}
              className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Database Credentials...</span>
                </>
              ) : (
                <span>Update Administrative Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success State */}
        {step === 'success' && (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Password Updated!</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your new administrative credentials have been hashed with bcrypt and saved directly to the database.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest justify-center shadow-xs transition"
            >
              Sign In to Control Center
            </Link>
          </div>
        )}

        {/* Footer Return Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
