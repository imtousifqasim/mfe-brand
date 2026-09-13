'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Radio
} from 'lucide-react';
import { Subscriber, SmtpConfig } from '@/repositories/newsletter.repository';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'notifications@mfebrand.com',
    pass: '••••••••••••••••',
    from_name: 'MFE Brand Haute Couture',
    from_email: 'concierge@mfebrand.com',
    is_connected: true,
  });

  const [loading, setLoading] = useState(true);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Broadcast email state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // SMTP test state
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Modal states for modern popups
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; subscriberId: string; email: string }>({
    isOpen: false,
    subscriberId: '',
    email: '',
  });

  const [confirmSendModal, setConfirmSendModal] = useState(false);

  const fetchSubscribersAndSmtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscribers');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        if (data.smtpConfig) {
          setSmtpConfig(data.smtpConfig);
        }
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribersAndSmtp();
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmtp(true);
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_smtp', smtpConfig }),
      });
      const data = await res.json();
      if (res.ok) {
        setBannerMsg({ type: 'success', text: 'SMTP server configuration saved successfully.' });
      } else {
        setBannerMsg({ type: 'error', text: data.error || 'Failed to save SMTP settings.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Network error saving SMTP config.' });
    } finally {
      setSavingSmtp(false);
      setTimeout(() => setBannerMsg(null), 4000);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_smtp', smtpConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setBannerMsg({ type: 'success', text: data.message });
      } else {
        setBannerMsg({ type: 'error', text: data.message || 'SMTP Connection Test Failed.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'SMTP Server could not be reached.' });
    } finally {
      setTestingSmtp(false);
      setTimeout(() => setBannerMsg(null), 5000);
    }
  };

  const handleConfirmSendBroadcast = async () => {
    setConfirmSendModal(false);
    setSendingBroadcast(true);
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_broadcast', subject, message }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBannerMsg({ type: 'success', text: data.message });
        setSubject('');
        setMessage('');
      } else {
        setBannerMsg({ type: 'error', text: data.error || 'Failed to send broadcast email.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Error dispatching email broadcast.' });
    } finally {
      setSendingBroadcast(false);
      setTimeout(() => setBannerMsg(null), 5000);
    }
  };

  const handleDeleteSubscriber = async () => {
    const id = deleteModal.subscriberId;
    setDeleteModal({ isOpen: false, subscriberId: '', email: '' });
    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_subscriber', id }),
      });
      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id));
        setBannerMsg({ type: 'success', text: 'Subscriber removed from VIP registry.' });
      }
    } catch {
      setBannerMsg({ type: 'error', text: 'Failed to delete subscriber.' });
    } finally {
      setTimeout(() => setBannerMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 font-sans">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-amber-500" />
            <span>VIP Subscribers & SMTP Email Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store and manage VIP salon subscribers who join from the footer, broadcast couture announcements, and connect your SMTP mail server.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubscribersAndSmtp}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Status Banner */}
      {bannerMsg && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border shadow-md animate-in fade-in duration-200 ${
          bannerMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          {bannerMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Section 1: SMTP Server Configuration (Connect real SMTP) */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              SMTP Mail Server Configuration
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Server Ready</span>
          </div>
        </div>

        <form onSubmit={handleSaveSmtp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                SMTP Host / Server
              </label>
              <input
                type="text"
                required
                placeholder="e.g. smtp.gmail.com or mail.mfebrand.com"
                value={smtpConfig.host}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Port (587 TLS / 465 SSL)
              </label>
              <input
                type="number"
                required
                value={smtpConfig.port}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                SMTP Username / Mailbox
              </label>
              <input
                type="text"
                required
                value={smtpConfig.user}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                SMTP Password / App Key
              </label>
              <input
                type="password"
                required
                value={smtpConfig.pass}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                From Name
              </label>
              <input
                type="text"
                required
                value={smtpConfig.from_name}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">
                From Email Address
              </label>
              <input
                type="email"
                required
                value={smtpConfig.from_email}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingSmtp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{testingSmtp ? 'Testing Connection...' : 'Test SMTP Connection'}</span>
            </button>

            <button
              type="submit"
              disabled={savingSmtp}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition shadow disabled:opacity-50"
            >
              {savingSmtp ? 'Saving...' : 'Save SMTP Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Send VIP Broadcast Email to Subscribers */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Send className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Compose & Dispatch Email Broadcast
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Targeting {subscribers.length} Registered VIPs
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Email Subject Line *
            </label>
            <input
              type="text"
              placeholder="e.g. Private Salon Exclusive: Spring Lawn Unstitched 3-Piece Capsule"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Email Message Content (HTML or Plaintext) *
            </label>
            <textarea
              rows={5}
              placeholder="Write your bespoke message to VIP salon patrons..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!subject.trim() || !message.trim()) {
                  setBannerMsg({ type: 'error', text: 'Please enter subject and message content before dispatching.' });
                  return;
                }
                setConfirmSendModal(true);
              }}
              disabled={sendingBroadcast}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingBroadcast ? 'Dispatching...' : 'Dispatch VIP Broadcast'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: VIP Subscribers Directory Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              VIP Salon Email Subscribers ({subscribers.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Registered via Storefront Footer
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading VIP patrons...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs text-slate-400">No VIP patrons subscribed yet.</p>
            <p className="text-[11px] text-slate-500">Submissions from the footer join form will automatically appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] bg-slate-900/80">
                  <th className="py-3 px-4">Patron Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white">
                      {sub.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase">
                        VIP Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteModal({
                            isOpen: true,
                            subscriberId: sub.id,
                            email: sub.email,
                          });
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Confirm Modal for Deletion (Replaces browser alert/confirm) */}
      <AdminConfirmModal
        isOpen={deleteModal.isOpen}
        title="Remove VIP Subscriber"
        message={`Are you sure you want to remove ${deleteModal.email} from the VIP salon pre-order registry?`}
        confirmText="Remove Subscriber"
        cancelText="Keep Subscriber"
        variant="danger"
        iconType="delete"
        onConfirm={handleDeleteSubscriber}
        onClose={() => setDeleteModal({ isOpen: false, subscriberId: '', email: '' })}
      />

      {/* Modern Confirm Modal for Dispatching Broadcast */}
      <AdminConfirmModal
        isOpen={confirmSendModal}
        title="Confirm VIP Broadcast Dispatch"
        message={`This broadcast email will be dispatched via SMTP to ${subscribers.length} active VIP salon subscribers. Are you ready to send?`}
        confirmText="Send Broadcast Now"
        cancelText="Review Again"
        variant="warning"
        iconType="edit"
        onConfirm={handleConfirmSendBroadcast}
        onClose={() => setConfirmSendModal(false)}
      />

    </div>
  );
}
