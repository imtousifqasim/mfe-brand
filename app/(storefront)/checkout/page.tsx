'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { SEED_PAYMENT_METHODS } from '@/lib/data/seed-data';
import { PaymentMethodCode, PaymentMethodConfig, Order } from '@/types/database';
import { 
  CheckCircle2, ShieldCheck, ArrowRight, Truck, AlertCircle, 
  Copy, Check, CreditCard, Building2, Sparkles, Smartphone,
  Lock, User, Eye, EyeOff
} from 'lucide-react';

export default function CheckoutPage() {
  const { items, subtotal, shipping, grandTotal, couponCode, couponDiscount, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('54000');
  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodCode>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(SEED_PAYMENT_METHODS);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Account creation at checkout
  const [createAccount, setCreateAccount] = useState(false);
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Fetch live active payment methods from backend
  useEffect(() => {
    async function fetchGateways() {
      try {
        const res = await fetch('/api/payment-methods');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
            setPaymentMethods(data.paymentMethods);
            // If current selectedPayment is not in active methods, select the first one
            if (!data.paymentMethods.some((pm: PaymentMethodConfig) => pm.code === selectedPayment)) {
              setSelectedPayment(data.paymentMethods[0].code);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic payment methods', err);
      }
    }
    fetchGateways();
  }, [selectedPayment]);

  const activePaymentConfig = paymentMethods.find(pm => pm.code === selectedPayment);

  const handleCopy = (text: string, field: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before checking out.');
      setIsSubmitting(false);
      return;
    }

    if (createAccount) {
      if (!accountPassword || accountPassword.length < 6) {
        setErrorMessage('Atelier account password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (accountPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your chosen password.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const finalNotes = [
        notes.trim(),
        transactionId.trim() ? `[Payment TID / Ref: ${transactionId.trim()}]` : ''
      ].filter(Boolean).join(' | ');

      const payload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        createAccount,
        password: createAccount ? accountPassword : undefined,
        username: createAccount ? (accountUsername.trim() || undefined) : undefined,
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
        paymentMethod: selectedPayment,
        shippingAddress: {
          first_name: fullName.split(' ')[0] || fullName,
          last_name: fullName.split(' ').slice(1).join(' ') || '',
          phone,
          email,
          address_line1: addressLine1,
          address_line2: addressLine2 || undefined,
          city,
          province,
          postal_code: postalCode,
          country: 'Pakistan',
        },
        orderNotes: finalNotes || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please check details.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully!
      setConfirmedOrder(data.order);
      clearCart();
    } catch (err: any) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully confirmed, show the receipt screen
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 font-sans bg-white text-[#141414]">
        <div className="w-20 h-20 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#141414]">
          Thank You! Order Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-[#6b6b6b] max-w-md mx-auto leading-relaxed">
          We have received your atelier booking. A confirmation email and tracking docket have been generated for <strong>{confirmedOrder.customer_email}</strong>.
        </p>

        <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 text-left shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-[#eae7e2] gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] block">Order Number</span>
              <span className="font-mono text-xl font-bold text-[#b87414]">{confirmedOrder.order_number}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] block">Grand Total</span>
              <span className="font-sans text-xl font-bold text-[#141414]">{formatPrice(confirmedOrder.grand_total)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] block">Payment Method</span>
              <span className="text-xs font-bold uppercase text-[#141414]">{confirmedOrder.payment_method}</span>
            </div>
          </div>

          <div className="text-xs text-[#6b6b6b] space-y-1.5">
            <div><strong className="text-[#141414]">Deliver to:</strong> {confirmedOrder.customer_name} ({confirmedOrder.customer_phone})</div>
            <div><strong className="text-[#141414]">Address:</strong> {confirmedOrder.shipping_address?.address_line1}, {confirmedOrder.shipping_address?.city}, {confirmedOrder.shipping_address?.province}</div>
          </div>

          <div className="p-4 bg-white border border-[#eae7e2] rounded-2xl text-xs text-[#141414] flex items-center gap-3">
            <Truck className="w-5 h-5 shrink-0 text-[#d99026]" />
            <span>You can monitor live dispatch milestones and courier status anytime on our tracking portal.</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={`/track-order?order=${confirmedOrder.order_number}&email=${encodeURIComponent(confirmedOrder.customer_email)}`}
            className="w-full sm:w-auto bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full transition shadow-md"
          >
            Track This Order
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto bg-[#141414] hover:bg-[#262626] text-white font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans bg-white text-[#141414]">
      <div className="pb-6 mb-10 border-b border-[#eae7e2]">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#b87414]">
          White-Glove Courier Delivery
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#141414] mt-1">
          Secure Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Customer Information & Delivery Address (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2]">
              1. Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                    Phone Number (for Courier SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
              </div>

              {/* Atelier Account Creation Section */}
              <div className="pt-4 border-t border-[#eae7e2]">
                <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-white border border-[#eae7e2] hover:border-[#d99026]/40 transition group">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="accent-[#b87414] w-4 h-4 mt-0.5 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-xs sm:text-sm text-[#141414] group-hover:text-[#b87414] transition">
                        Create an Atelier Patron Account
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#d99026]/15 text-[#b87414]">
                        VIP Privileges
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6b6b6b] mt-0.5 leading-relaxed">
                      Receive immediate login credentials via email for live courier tracking, order invoices, and VIP Salon previews.
                    </p>
                  </div>
                </label>

                {createAccount && (
                  <div className="mt-3.5 p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd2] space-y-3.5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b87414]">
                      <Sparkles className="w-4 h-4" />
                      <span>Set Up Your Patron Credentials</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#141414] mb-1">
                        Patron Username (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c827a]" />
                        <input
                          type="text"
                          value={accountUsername}
                          onChange={(e) => setAccountUsername(e.target.value)}
                          placeholder={email || "e.g. ayesha.couture"}
                          className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#d99026]"
                        />
                      </div>
                      <span className="text-[10px] text-[#8c827a] mt-1 block">If left empty, your email will be your account login.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#141414] mb-1">
                          Choose Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c827a]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={accountPassword}
                            onChange={(e) => setAccountPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#d99026]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c827a] hover:text-[#141414]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#141414] mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c827a]" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#8c827a] focus:outline-none focus:border-[#d99026]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#e8dfd2] text-[11px] text-[#6b6b6b] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Your account will be created instantly and login credentials sent to <strong>{email || 'your email'}</strong>.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2]">
              2. Delivery Address (Pakistan)
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                  Street Address & House / Flat # *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House 12-A, Street 4, Phase 6 DHA"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                  Apartment, Suite, Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Apartment 402, Tower B"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] focus:outline-none focus:border-[#d99026]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414] mb-1.5">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Call before delivery, leave with reception..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-white border border-[#eae7e2] text-[#141414] placeholder-[#6b6b6b] focus:outline-none focus:border-[#d99026]"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#eae7e2]">
              <h2 className="font-serif text-xl font-bold text-[#141414]">
                3. Payment Method
              </h2>
              <span className="text-[11px] font-bold text-[#b87414] bg-[#d99026]/10 px-3 py-1 rounded-full border border-[#d99026]/20">
                100% Secure Checkout
              </span>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {paymentMethods.map((pm) => {
                const isSelected = selectedPayment === pm.code;
                return (
                  <label
                    key={pm.code}
                    className={`relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#b87414] bg-white ring-2 ring-[#d99026]/30 shadow-md scale-[1.01]'
                        : 'border-[#eae7e2] bg-white hover:border-[#b87414]/50 hover:bg-[#faf9f6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {pm.logo_url ? (
                          <div className="w-10 h-10 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] p-1.5 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pm.logo_url}
                              alt={pm.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#f7f5f2] border border-[#eae7e2] flex items-center justify-center shrink-0 text-[#b87414]">
                            <CreditCard className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-[#141414] block">
                            {pm.name}
                          </span>
                          {pm.badge && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#d99026]/15 text-[#b87414]">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="payment"
                        checked={isSelected}
                        onChange={() => setSelectedPayment(pm.code as PaymentMethodCode)}
                        className="accent-[#b87414] w-4 h-4 mt-1"
                      />
                    </div>

                    <p className="text-[11px] text-[#6b6b6b] leading-relaxed">
                      {pm.instructions}
                    </p>
                  </label>
                );
              })}
            </div>

            {/* Selected Method Details & Credentials (for JazzCash, Easypaisa, Bank Transfer, SadaPay, NayaPay) */}
            {activePaymentConfig && (activePaymentConfig.account_title || activePaymentConfig.till_id || activePaymentConfig.account_number || activePaymentConfig.iban) && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1c1c1f] to-[#121214] text-white border border-[#333338] shadow-lg space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    {activePaymentConfig.logo_url ? (
                      <div className="w-7 h-7 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={activePaymentConfig.logo_url} alt={activePaymentConfig.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    ) : (
                      <Building2 className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        {activePaymentConfig.name} — Payment Credentials
                      </h4>
                      <p className="text-[10px] text-slate-400">Transfer total order amount to complete verification</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Official Business Gateway
                  </span>
                </div>

                {/* Account Details Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {activePaymentConfig.account_title && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Title / Owner</span>
                        <span className="font-mono text-xs font-bold text-amber-300">{activePaymentConfig.account_title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePaymentConfig.account_title!, 'title')}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                        title="Copy Account Title"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {activePaymentConfig.till_id && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">Merchant Till ID</span>
                        <span className="font-mono text-sm font-black tracking-widest text-white">{activePaymentConfig.till_id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePaymentConfig.till_id!, 'till')}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                        title="Copy Till ID"
                      >
                        {copiedField === 'till' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {activePaymentConfig.account_number && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Account / Mobile Number</span>
                        <span className="font-mono text-xs font-bold text-white tracking-wider">{activePaymentConfig.account_number}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePaymentConfig.account_number!, 'acc')}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                        title="Copy Account Number"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {activePaymentConfig.bank_name && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Name</span>
                      <span className="text-xs font-bold text-white">{activePaymentConfig.bank_name}</span>
                    </div>
                  )}

                  {activePaymentConfig.iban && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">IBAN (International / 1-Link)</span>
                        <span className="font-mono text-xs font-bold text-amber-300 tracking-wider break-all">{activePaymentConfig.iban}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activePaymentConfig.iban!, 'iban')}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition shrink-0 ml-2"
                        title="Copy IBAN"
                      >
                        {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Customer Transaction Reference Input (TID) */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Transaction ID (TID) / Reference Number</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Required for instant dispatch</span>
                  </div>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 12-digit JazzCash/Easypaisa TID (129038472910)"
                    className="w-full text-xs p-3.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    * Once you transfer {formatPrice(grandTotal)} via your app, paste the transaction reference ID from your SMS receipt above.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Order Summary Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2]">
              Ensemble Order Summary
            </h2>

            {/* Items review */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => {
                const price = product.sale_price ?? product.regular_price;
                return (
                  <div key={product.id} className="flex justify-between items-center text-xs gap-3">
                    <div className="truncate">
                      <p className="font-bold text-[#141414] truncate">{product.name}</p>
                      <p className="text-[#6b6b6b] text-[11px]">Qty: {quantity} × {formatPrice(price)}</p>
                    </div>
                    <span className="font-sans font-bold text-[#141414] shrink-0">
                      {formatPrice(price * quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-xs pt-4 border-t border-[#eae7e2]">
              <div className="flex justify-between text-[#6b6b6b]">
                <span>Subtotal</span>
                <span className="font-sans font-bold text-[#141414] text-sm">{formatPrice(subtotal)}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span className="font-sans font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#6b6b6b]">
                <span>Courier Dispatch (Pakistan)</span>
                <span className="text-[#141414] font-bold">
                  {shipping === 0 ? <span className="text-emerald-700 uppercase tracking-wider text-[11px] font-bold">Complimentary</span> : formatPrice(shipping)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#eae7e2] flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider text-[#141414]">Grand Total</span>
                <span className="font-sans text-2xl font-black text-[#141414]">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-[#d99026] hover:bg-[#c67d18] text-[#141414] font-bold text-xs uppercase tracking-[0.16em] py-4 rounded-full flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Confirming Atelier Booking...' : 'Confirm Booking (Place Order)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#6b6b6b] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b87414]" />
              <span>256-bit Encrypted SSL & Authentic Courier Handover</span>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
