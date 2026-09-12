'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  QrCode,
  ShieldAlert,
  Trash2
} from 'lucide-react';

interface AdminProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  two_factor_enabled: boolean;
  last_login_at?: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA Setup fields
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Disable 2FA modal
  const [disableModal, setDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/auth/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.admin);
        setFullName(data.admin.full_name || '');
        setEmail(data.admin.email || '');
        setNewUsername(data.admin.username || '');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/admin/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          newUsername,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.error || 'Failed to update profile' });
      } else {
        setProfileMsg({ type: 'success', text: 'Administrative profile saved in database!' });
        fetchProfile();
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Connection error while saving profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Update
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setPasswordSaving(true);

    try {
      const res = await fetch('/api/admin/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password' });
      } else {
        setPasswordMsg({ type: 'success', text: 'Password successfully changed and saved to database!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Connection error while updating password' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Begin 2FA Setup
  const startTwoFactorSetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/2fa', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setTwoFactorMsg({ type: 'error', text: data.error || 'Failed to generate 2FA secret' });
      } else {
        setSecretKey(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
        setSetupMode(true);
      }
    } catch {
      setTwoFactorMsg({ type: 'error', text: 'Failed to initiate 2FA setup' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Verify and Activate 2FA
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey || !verifyCode) return;

    setTwoFactorLoading(true);
    setTwoFactorMsg(null);

    try {
      const res = await fetch('/api/admin/auth/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          code: verifyCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTwoFactorMsg({ type: 'error', text: data.error || 'Verification failed' });
      } else {
        setTwoFactorMsg({ type: 'success', text: 'Google Authenticator 2FA active & saved to database!' });
        setSetupMode(false);
        setVerifyCode('');
        fetchProfile();
      }
    } catch {
      setTwoFactorMsg({ type: 'error', text: 'Error activating 2FA' });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabling(true);

    try {
      const res = await fetch('/api/admin/auth/2fa', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTwoFactorMsg({ type: 'error', text: data.error || 'Failed to disable 2FA' });
      } else {
        setTwoFactorMsg({ type: 'success', text: 'Two-Factor Authentication disabled.' });
        setDisableModal(false);
        setDisablePassword('');
        fetchProfile();
      }
    } catch {
      setTwoFactorMsg({ type: 'error', text: 'Error disabling 2FA' });
    } finally {
      setDisabling(false);
    }
  };

  const copySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs uppercase tracking-widest">Loading Administrative Security Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 font-sans text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Root Administrator Security Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Profile & Authenticator Security
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your administrative identity, rotate secret keys, and configure Google Authenticator (TOTP).
          </p>
        </div>

        {/* 2FA Status Indicator */}
        <div className="flex items-center gap-2">
          {profile?.two_factor_enabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>2FA Authenticator Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>2FA Inactive (Recommended)</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SECTION 1: Profile Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Administrative Identity
              </h2>
              <p className="text-[11px] text-slate-400">Update administrative username and contact email.</p>
            </div>
          </div>

          {profileMsg && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Administrator Username (Login Handle)
              </label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Security Recovery Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{profileSaving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: Change Password */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Rotate Secret Key / Password
              </h2>
              <p className="text-[11px] text-slate-400">Update your bcrypt password in the database.</p>
            </div>
          </div>

          {passwordMsg && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                New Password (Min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving || !newPassword || !currentPassword}
                className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* SECTION 3: Two-Factor Authentication (Google Authenticator / TOTP) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Two-Factor Authenticator (Google Authenticator / 2FA)
              </h2>
              <p className="text-[11px] text-slate-400">
                Enforce a dynamic 6-digit TOTP security code required alongside your password upon login.
              </p>
            </div>
          </div>

          <div>
            {profile?.two_factor_enabled ? (
              <button
                type="button"
                onClick={() => setDisableModal(true)}
                className="py-2.5 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Disable 2FA</span>
              </button>
            ) : (
              !setupMode && (
                <button
                  type="button"
                  onClick={startTwoFactorSetup}
                  disabled={twoFactorLoading}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow flex items-center gap-2 cursor-pointer"
                >
                  {twoFactorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                  <span>Set Up Google Authenticator</span>
                </button>
              )
            )}
          </div>
        </div>

        {twoFactorMsg && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            twoFactorMsg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}>
            {twoFactorMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{twoFactorMsg.text}</span>
          </div>
        )}

        {/* 2FA Enabled State Details */}
        {profile?.two_factor_enabled && !setupMode && (
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-4 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-300 block text-sm">
                Two-Factor Protection is Active
              </span>
              <p className="text-slate-400 leading-relaxed">
                Your administrative control panel is secured. Every login session requires your 6-digit TOTP verification code from Google Authenticator or Microsoft Authenticator.
              </p>
            </div>
          </div>
        )}

        {/* 2FA Setup Flow with Live QR Code */}
        {setupMode && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-6">
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
                Step 1: Scan QR Code with Google Authenticator
              </span>
              <p className="text-slate-400">
                Open Google Authenticator on your mobile phone, tap '+', and scan this QR code or enter the secret key manually.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
              {qrCodeUrl && (
                <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                  <img src={qrCodeUrl} alt="Google Authenticator QR Code" className="w-36 h-36" />
                </div>
              )}
              <div className="space-y-2 text-xs">
                <span className="text-slate-400 block font-semibold">Or enter this manual secret key:</span>
                <div className="flex items-center gap-2 font-mono text-amber-300 text-sm font-bold bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span>{secretKey}</span>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="p-1 hover:text-white transition"
                    title="Copy Key"
                  >
                    {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Account: MFE Brand Control ({profile?.username})
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4 pt-2">
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] block">
                  Step 2: Verify 6-Digit Code & Activate
                </span>
                <p className="text-slate-400">
                  Enter the 6-digit code currently shown in your Authenticator app to confirm setup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full sm:w-48 text-center text-lg font-mono font-bold tracking-[0.3em] p-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={twoFactorLoading || verifyCode.length !== 6}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {twoFactorLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Verify & Activate in Database</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetupMode(false)}
                  className="py-3 px-4 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Disable 2FA Modal Dialog */}
      {disableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Disable Two-Factor Authentication</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disabling 2FA reduces account security. Enter your administrative password to confirm deactivation.
            </p>
            <form onSubmit={handleDisable2FA} className="space-y-4 text-xs">
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setDisableModal(false); setDisablePassword(''); }}
                  className="py-2.5 px-4 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disabling || !disablePassword}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition disabled:opacity-50 flex items-center gap-2"
                >
                  {disabling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Deactivate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
