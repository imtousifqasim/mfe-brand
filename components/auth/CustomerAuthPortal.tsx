'use client';

import React, { useState } from 'react';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

export function CustomerAuthPortal({ onSuccess }: { onSuccess?: () => void }) {
  const { login, register } = useCustomer();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
        return;
      }
      onSuccess?.();
    } else {
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please complete all required fields.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed. Please try again.');
        return;
      }
      onSuccess?.();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-10 rounded-3xl bg-white border border-[#eae7e2] shadow-xl text-[#141414] font-sans relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] text-[#b87414] mb-3 shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#141414]">
          MFE Patron Lounge
        </h2>
        <p className="text-xs text-[#6b6b6b] mt-1 max-w-xs mx-auto">
          Authenticate to access your private atelier consignments, address book, and couture privileges.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex rounded-2xl bg-[#faf8f5] p-1 mb-6 border border-[#eae7e2] relative z-10">
        <button
          type="button"
          onClick={() => { setTab('login'); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            tab === 'login'
              ? 'bg-[#141414] text-white shadow-md'
              : 'text-[#6b6b6b] hover:text-[#141414]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); setError(null); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            tab === 'register'
              ? 'bg-[#141414] text-white shadow-md'
              : 'text-[#6b6b6b] hover:text-[#141414]'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {tab === 'register' && (
          <div>
            <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Fatima Ali"
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#faf8f5] border border-[#eae7e2] rounded-xl text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414] focus:ring-1 focus:ring-[#b87414] transition disabled:opacity-50"
              />
              <User className="w-4 h-4 text-[#8c827a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@domain.com"
              className="w-full pl-10 pr-4 py-3 text-xs bg-[#faf8f5] border border-[#eae7e2] rounded-xl text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414] focus:ring-1 focus:ring-[#b87414] transition disabled:opacity-50"
            />
            <Mail className="w-4 h-4 text-[#8c827a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {tab === 'register' && (
          <div>
            <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <input
                type="tel"
                disabled={loading}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-10 pr-4 py-3 text-xs bg-[#faf8f5] border border-[#eae7e2] rounded-xl text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414] focus:ring-1 focus:ring-[#b87414] transition disabled:opacity-50"
              />
              <Phone className="w-4 h-4 text-[#8c827a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
            Security Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 text-xs bg-[#faf8f5] border border-[#eae7e2] rounded-xl text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414] focus:ring-1 focus:ring-[#b87414] transition disabled:opacity-50"
            />
            <Lock className="w-4 h-4 text-[#8c827a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-[#8c827a] hover:text-[#141414] absolute right-3 top-1/2 -translate-y-1/2 transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#b87414] to-[#d99026] hover:from-[#a06310] hover:to-[#c6801e] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>{tab === 'login' ? 'Enter Patron Lounge' : 'Create Atelier Account'}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Footer Security Note */}
      <div className="mt-6 pt-5 border-t border-[#eae7e2] flex items-center justify-center gap-2 text-[11px] text-[#8c827a]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#b87414]" />
        <span>256-bit encrypted private patron session</span>
      </div>

    </div>
  );
}
