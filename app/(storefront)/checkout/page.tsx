'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { SEED_PAYMENT_METHODS } from '@/lib/data/seed-data';
import { PaymentMethodCode, Order } from '@/types/database';
import { CheckCircle2, ShieldCheck, ArrowRight, Truck, AlertCircle } from 'lucide-react';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products before checking out.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
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
        orderNotes: notes || undefined,
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

          <div className="bg-[#f7f5f2] border border-[#eae7e2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#141414] pb-3 border-b border-[#eae7e2]">
              3. Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SEED_PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.code}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                    selectedPayment === pm.code
                      ? 'border-[#d99026] bg-[#d99026]/10 shadow-sm'
                      : 'border-[#eae7e2] bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#141414]">
                      {pm.name}
                    </span>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === pm.code}
                      onChange={() => setSelectedPayment(pm.code as PaymentMethodCode)}
                      className="accent-[#d99026]"
                    />
                  </div>
                  <p className="text-[11px] text-[#6b6b6b] leading-relaxed">
                    {pm.instructions}
                  </p>
                </label>
              ))}
            </div>
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
