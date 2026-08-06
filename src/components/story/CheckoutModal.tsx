import React, { useState } from 'react';
import { Template, Story, Order, PaymentGatewayConfig } from '../../types';
import { store } from '../../lib/store';
import { ShieldCheck, CreditCard, Smartphone, Tag, CheckCircle2, X, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface CheckoutModalProps {
  template: Template;
  storyData: Record<string, any>;
  onClose: () => void;
  onSuccess: (story: Story, order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  template,
  storyData,
  onClose,
  onSuccess,
}) => {
  const [payConfig] = useState<PaymentGatewayConfig>(() => store.getPaymentConfig());
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'netbanking' | 'razorpay'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const basePrice = template.price || 0;
  const tax = 0; // standard inclusive tax
  const totalAmount = Math.max(0, basePrice - discountAmount + tax);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    const result = await store.validateCoupon(couponCode, basePrice);
    if (result.valid) {
      setAppliedCoupon(result.coupon);
      setDiscountAmount(result.discountAmount);
    } else {
      setCouponError(result.error || 'Invalid coupon');
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(payConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePayAndPublish = async () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail.trim() || !emailRegex.test(userEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    if (totalAmount > 0 && paymentMethod === 'upi' && !utrNumber.trim()) {
      alert('Please enter your 12-digit UPI UTR / Transaction Reference number after completing payment.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Verifying payment details with bank gateway...');

    await new Promise((r) => setTimeout(r, 800));
    setProcessingStatus('Securing database record and publishing link...');

    // 1. Create story (always mark as paid if free, or if payment completed)
    const newStory: Story = {
      id: 'st_' + Math.random().toString(36).substr(2, 9),
      slug: 'love-' + Math.random().toString(36).substr(2, 8),
      templateId: template.id,
      templateSnapshot: template,
      userEmail,
      senderName: storyData.senderName || 'Anonymous',
      recipientName: storyData.recipientName || 'Beloved',
      storyData,
      isPaid: true, // Mark as paid for both free templates and paid orders after checkout
      isPublished: true,
      views: 0,
      uniqueVisits: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedStory = await store.saveStory(newStory);

    // 2. Create order (always record the transaction, even for free templates)
    const orderData: Partial<Order> = {
      storyId: savedStory.id,
      templateId: template.id,
      templateName: template.name,
      userEmail,
      amount: basePrice,
      discount: discountAmount,
      tax,
      totalAmount,
      paymentMethod: totalAmount === 0 ? 'wallet' : paymentMethod, // Use 'wallet' for free templates
      paymentStatus: totalAmount === 0 ? 'paid' : 'paid', // Always mark as paid after checkout
      utrNumber: totalAmount > 0 && paymentMethod === 'upi' ? utrNumber.trim() : undefined,
      couponCode: appliedCoupon?.code,
    };

    const savedOrder = await store.createOrder(orderData);

    await new Promise((r) => setTimeout(r, 600));
    setIsProcessing(false);
    onSuccess(savedStory, savedOrder);
  };

  const upiQrUrl = payConfig.upiQrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${payConfig.upiId}&pn=${encodeURIComponent(payConfig.upiName)}&am=${totalAmount}&cu=INR`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            Unlock & Publish Your Surprise
          </h3>
          <p className="text-xs text-slate-500">Instant lifetime link generation + HD QR Code</p>
        </div>

        {isProcessing ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{processingStatus}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Template Summary */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{template.name}</h4>
                <p className="text-xs text-slate-500">Recipient: {storyData.recipientName || 'Beloved'}</p>
              </div>
              <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                {basePrice === 0 ? 'FREE' : `₹${basePrice}`}
              </span>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Your Email Address (For Edit Access) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              {emailError && (
                <p className="text-xs text-red-500 font-semibold mt-1">{emailError}</p>
              )}
            </div>

            {/* Coupon Code Section */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Have a Promo Code / Coupon?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LOVE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-rose-500 font-bold text-xs hover:opacity-90"
                >
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Coupon '{appliedCoupon.code}' Applied! Saved ₹{discountAmount.toFixed(2)}
                </p>
              )}
              {couponError && <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>}
            </div>

            {/* Payment Method Selection */}
            {totalAmount > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      paymentMethod === 'upi'
                        ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI / Scan QR (INR ₹)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      paymentMethod === 'razorpay'
                        ? 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> Razorpay / Cards
                  </button>
                </div>

                {/* UPI Payment Gateway Details */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-32 h-32 bg-white p-2 rounded-xl border shadow-inner flex shrink-0 items-center justify-center">
                        <img src={upiQrUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                      </div>

                      <div className="space-y-1.5 flex-1 text-center sm:text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Scan & Pay via GPay / PhonePe / Paytm</p>
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">{payConfig.upiId}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Payee: {payConfig.upiName}</p>
                        <p className="text-[11px] font-black text-emerald-600">Amount: ₹{totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Enter 12-Digit Transaction UTR / Ref No. *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 329812349812"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>₹{basePrice.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t">
                <span>Total Due</span>
                <span className="text-rose-600 dark:text-rose-400">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay / Unlock Button */}
            <button
              onClick={handlePayAndPublish}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              {totalAmount === 0 ? 'Publish Free Surprise Now' : `Confirm Payment of ₹${totalAmount.toFixed(2)} & Publish Now`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
