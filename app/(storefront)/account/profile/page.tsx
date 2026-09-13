'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, CheckCircle2, Loader2, AlertCircle, ShieldCheck, 
  KeyRound, Smartphone, Lock, Eye, EyeOff, Check, Copy, Trash2
} from 'lucide-react';
import { useCustomer } from '@/components/providers/CustomerProvider';

export default function CustomerProfilePage() {
  const { customer, updateProfile } = useCustomer();
  
  // Tab selector
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security / Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [activating2FA, setActivating2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (customer) {
      setFullName(customer.full_name || '');
      setPhone(customer.phone || '');

      // Check 2FA status
      fetch('/api/auth/customer/security')
        .then(res => res.json())
        .then(data => {
          setTwoFactorEnabled(Boolean(data.two_factor_enabled));
        })
        .catch(() => {})
        .finally(() => setTwoFactorLoading(false));
    }
  }, [customer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
    });

    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } else {
      setError(res.error || 'Failed to update profile in database.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch('/api/auth/customer/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      setPasswordSaving(false);

      if (!res.ok) {
        setPasswordError(data.error || 'Failed to update password.');
        return;
      }

      setPasswordSuccess('Password successfully updated in your patron record!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch {
      setPasswordSaving(false);
      setPasswordError('Network error updating password.');
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorError(null);
    setTwoFactorMsg(null);
    setActivating2FA(true);

    try {
      const res = await fetch('/api/auth/customer/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_2fa' }),
      });
      const data = await res.json();
      setActivating2FA(false);

      if (res.ok && data.qrCodeUrl) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
      } else {
        setTwoFactorError(data.error || 'Failed to initialize 2FA.');
      }
    } catch {
      setActivating2FA(false);
      setTwoFactorError('Network error setting up 2FA.');
    }
  };

  const handleVerifyAndEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret || !totpCode) return;

    setActivating2FA(true);
    setTwoFactorError(null);

    try {
      const res = await fetch('/api/auth/customer/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, code: totpCode.trim() }),
      });
      const data = await res.json();
      setActivating2FA(false);

      if (!res.ok) {
        setTwoFactorError(data.error || 'Invalid 2FA code.');
        return;
      }

      setTwoFactorEnabled(true);
      setQrCodeUrl(null);
      setSecret(null);
      setTotpCode('');
      setTwoFactorMsg('Two-Factor Authentication is now active! Your patron account is secured.');
      setTimeout(() => setTwoFactorMsg(null), 5000);
    } catch {
      setActivating2FA(false);
      setTwoFactorError('Failed to confirm 2FA.');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) return;

    setDisabling2FA(true);
    setTwoFactorError(null);

    try {
      const res = await fetch('/api/auth/customer/security', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      setDisabling2FA(false);

      if (!res.ok) {
        setTwoFactorError(data.error || 'Incorrect password.');
        return;
      }

      setTwoFactorEnabled(false);
      setDisablePassword('');
      setTwoFactorMsg('Two-Factor Authentication has been disabled.');
      setTimeout(() => setTwoFactorMsg(null), 4000);
    } catch {
      setDisabling2FA(false);
      setTwoFactorError('Failed to disable 2FA.');
    }
  };

  if (!customer) return null;

  return (
    <div className="bg-white border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl font-sans text-[#141414]">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#eae7e2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b87414]/10 text-[#b87414] text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Patron Lounge Security</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#141414]">
            Profile & Authentication Vault
          </h1>
          <p className="text-xs text-[#6b6b6b] mt-1">
            Manage your verified contact identity and configure Two-Factor Authentication.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#faf8f5] p-1 rounded-2xl border border-[#eae7e2] self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'profile'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414]'
            }`}
          >
            Profile Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-[#6b6b6b] hover:text-[#141414]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#b87414]" />
            <span>Security & 2FA</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {saved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Profile changes successfully updated in atelier database!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl bg-[#faf8f5] border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
                Verified Email Address
              </label>
              <input
                type="email"
                disabled
                value={customer.email}
                className="w-full text-xs p-3.5 rounded-xl bg-[#f5f1eb] border border-[#eae7e2] text-[#8c827a] cursor-not-allowed"
              />
              <span className="text-[10px] text-[#8c827a] mt-1 block">
                Email is permanently bound to your Maison patron record.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#525252] uppercase tracking-wider mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs p-3.5 rounded-xl bg-[#faf8f5] border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#b87414]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#262626] transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SECURITY, PASSWORD CHANGE & 2FA */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          
          {/* Section 1: Change Password */}
          <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#eae7e2]">
              <Lock className="w-4 h-4 text-[#b87414]" />
              <h2 className="font-serif text-base font-bold text-[#141414]">
                Change Account Password
              </h2>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#525252] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#525252] mb-1">
                    New Secret Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full text-xs pl-3 pr-9 py-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c827a] hover:text-[#141414]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#525252] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full text-xs p-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving || !currentPassword || !newPassword}
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#262626] transition shadow disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>

          {/* Section 2: Two-Factor Authentication (2FA) */}
          <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#eae7e2] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eae7e2]">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-[#b87414]" />
                <div>
                  <h2 className="font-serif text-base font-bold text-[#141414]">
                    Two-Factor Authenticator (2FA)
                  </h2>
                  <p className="text-[11px] text-[#6b6b6b]">
                    Protect your atelier orders with Google Authenticator or Microsoft Authenticator.
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                twoFactorEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}>
                {twoFactorEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>

            {twoFactorMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{twoFactorMsg}</span>
              </div>
            )}

            {twoFactorError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{twoFactorError}</span>
              </div>
            )}

            {!twoFactorEnabled && !qrCodeUrl && (
              <div className="space-y-3">
                <p className="text-xs text-[#525252] leading-relaxed">
                  Require a 6-digit verification code from your authenticator app each time you sign into your patron lounge.
                </p>
                <button
                  type="button"
                  onClick={handleGenerate2FA}
                  disabled={activating2FA}
                  className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#b87414] text-white hover:bg-[#975c09] transition shadow flex items-center gap-2 cursor-pointer"
                >
                  {activating2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Configure Google Authenticator</span>
                </button>
              </div>
            )}

            {/* QR Setup Modal Box */}
            {qrCodeUrl && (
              <div className="p-5 rounded-xl bg-white border border-[#b87414]/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                  Scan Authenticator QR Code
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="w-36 h-36 border border-[#eae7e2] p-1.5 rounded-xl bg-white shrink-0 shadow-sm"
                  />
                  <div className="space-y-3 flex-1 text-xs text-[#525252]">
                    <p>1. Open Google Authenticator or Microsoft Authenticator on your phone.</p>
                    <p>2. Tap Scan QR Code or manually type this secret key:</p>
                    <div className="flex items-center gap-2 font-mono text-xs font-bold bg-[#faf8f5] p-2 rounded-lg border border-[#eae7e2] text-[#b87414]">
                      <span>{secret}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (secret) {
                            navigator.clipboard.writeText(secret);
                            setCopiedSecret(true);
                            setTimeout(() => setCopiedSecret(false), 2000);
                          }
                        }}
                        className="p-1 hover:text-[#141414]"
                        title="Copy Secret"
                      >
                        {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifyAndEnable2FA} className="pt-2 border-t border-[#eae7e2] flex items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit code"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-48 text-center tracking-[0.25em] font-mono text-sm p-2.5 rounded-xl bg-[#faf8f5] border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#b87414]"
                  />
                  <button
                    type="submit"
                    disabled={activating2FA || !totpCode.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#141414] text-white hover:bg-[#262626] transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {activating2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Activate 2FA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQrCodeUrl(null); setSecret(null); }}
                    className="text-xs text-[#6b6b6b] hover:text-[#141414]"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* If 2FA is active, show option to disable */}
            {twoFactorEnabled && (
              <form onSubmit={handleDisable2FA} className="pt-2 space-y-3">
                <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  ✓ Two-Factor Authentication is currently protecting your patron account.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    required
                    placeholder="Enter password to disable 2FA"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    disabled={disabling2FA || !disablePassword}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {disabling2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disable 2FA</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
