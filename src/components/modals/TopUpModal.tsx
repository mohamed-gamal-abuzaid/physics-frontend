'use client';

import React, { useState, useEffect } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/lib/api/student.api';
import {
  X, Zap, CheckCircle2, Smartphone, PhoneCall, Building2,
  Upload, Copy, Check, ShieldCheck, Clock, Tag, Percent, ArrowRight
} from 'lucide-react';
import { compressImage } from '@/lib/imageCompressor';
import type { StudentPricingOption } from '@/lib/types';

const PAYMENT_METHODS = [
  {
    id: 'InstaPay',
    name: 'InstaPay',
    account: '01024856513 / mohammed.sayed@instapay',
    instructions: 'Instant bank transfer via InstaPay application',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'Vodafone Cash',
    name: 'Vodafone Cash',
    account: '010 9982 3412',
    instructions: 'Transfer to official Vodafone Cash Academy wallet',
    icon: PhoneCall,
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'Bank Transfer / IBAN',
    name: 'CIB Bank Transfer',
    account: 'EG38 0010 0045 0000 1000 2345 678',
    instructions: 'Commercial International Bank (CIB) Academy Account',
    icon: Building2,
    color: 'from-blue-600 to-indigo-700',
  },
];

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, showToast } = useUI();
  const queryClient = useQueryClient();

  const [sessionFormat, setSessionFormat] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');
  const [selectedPricingId, setSelectedPricingId] = useState<number | null>(null);

  // Coupon / Discount state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [customDiscount, setCustomDiscount] = useState<{
    discountAmount: number;
    finalPrice: number;
    title: string;
    code: string;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Payment form state
  const [selectedMethod, setSelectedMethod] = useState('InstaPay');
  const [senderAccountOrPhone, setSenderAccountOrPhone] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Fetch level-based pricing and available discounts for this student
  const {
    data: pricingResponse,
    isLoading: isLoadingPricing,
  } = useQuery({
    queryKey: ['student-pricing', sessionFormat],
    queryFn: () => studentApi.getPricing({ format: sessionFormat }),
    enabled: isTopUpOpen,
  });

  const pricingList: StudentPricingOption[] = pricingResponse?.pricing || [];
  const studentLevel = pricingResponse?.studentLevel;

  // Automatically select first pricing package or keep selection
  useEffect(() => {
    if (pricingList.length > 0) {
      if (!selectedPricingId || !pricingList.some((p) => p.id === selectedPricingId)) {
        setSelectedPricingId(pricingList[0].id);
      }
    } else {
      setSelectedPricingId(null);
    }
  }, [pricingList, selectedPricingId]);

  // Selected package
  const activePackage = pricingList.find((p) => p.id === selectedPricingId) || null;

  // Reset coupon state when package changes
  useEffect(() => {
    setCustomDiscount(null);
    setAppliedCoupon(null);
    setCouponError(null);
  }, [selectedPricingId]);

  // Handle applying coupon code
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    if (!selectedPricingId) {
      showToast('Please select a session package first.', 'error');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await studentApi.calculatePrice({
        pricingId: selectedPricingId,
        discountCode: couponInput.trim(),
      });
      setAppliedCoupon(couponInput.trim().toUpperCase());
      setCustomDiscount({
        discountAmount: res.discountAmount,
        finalPrice: res.finalPrice,
        title: res.discountApplied?.title || 'Promo Code Applied',
        code: res.discountApplied?.code || couponInput.trim().toUpperCase(),
      });
      showToast(`Coupon "${couponInput.trim().toUpperCase()}" applied successfully!`, 'success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid or expired coupon code.';
      setCouponError(msg);
      showToast(msg, 'error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedCoupon(null);
    setCustomDiscount(null);
    setCouponError(null);
  };

  // Pricing calculations
  const originalPrice = activePackage ? Number(activePackage.price) : 0;
  const autoDiscountAmount = activePackage?.hasDiscount ? activePackage.discountAmount : 0;
  const discountAmount = customDiscount ? customDiscount.discountAmount : autoDiscountAmount;
  const finalPayable = customDiscount
    ? customDiscount.finalPrice
    : activePackage
    ? activePackage.finalPrice
    : originalPrice;
  const activeDiscountCode = customDiscount
    ? customDiscount.code
    : activePackage?.applicableDiscount?.code || undefined;

  const paymentMutation = useMutation({
    mutationFn: studentApi.createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      showToast('Payment proof submitted successfully! Staff will verify and credit your account.', 'success');
      setIsTopUpOpen(false);
      handleResetForm();
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to submit payment proof.', 'error');
    },
  });

  const handleResetForm = () => {
    setSenderAccountOrPhone('');
    setTransactionRef('');
    setScreenshotUrl('');
    setNotes('');
    setCouponInput('');
    setAppliedCoupon(null);
    setCustomDiscount(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.6);
        setScreenshotUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  if (!isTopUpOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage) {
      showToast('Please select a session package.', 'error');
      return;
    }
    if (!senderAccountOrPhone.trim()) {
      showToast('Please enter the sender phone number or account used for the transfer.', 'error');
      return;
    }
    if (!screenshotUrl) {
      showToast('Please upload or attach a screenshot of your transfer receipt.', 'error');
      return;
    }

    paymentMutation.mutate({
      packageName: activePackage.title,
      sessionsCount: activePackage.sessionsCount,
      creditType: sessionFormat === 'PRIVATE' ? '1-to-1' : 'group',
      amount: finalPayable,
      paymentMethod: selectedMethod,
      senderAccountOrPhone: senderAccountOrPhone.trim(),
      transactionRef: transactionRef.trim() || undefined,
      screenshotUrl,
      notes: notes.trim() || undefined,
      pricingId: activePackage.id,
      discountCode: activeDiscountCode,
      originalAmount: originalPrice,
      discountAmount: discountAmount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Purchase Physics Sessions</h3>
                <p className="text-xs text-indigo-200">
                  {studentLevel ? `Custom rates for: ${studentLevel}` : 'Choose sessions & apply promotional discounts'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsTopUpOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Tuition Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSessionFormat('PRIVATE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  sessionFormat === 'PRIVATE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Private 1-on-1 Sessions
              </button>
              <button
                type="button"
                onClick={() => setSessionFormat('GROUP')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  sessionFormat === 'GROUP'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Group Sessions
              </button>
            </div>
          </div>

          {/* Package Selection Cards */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Available Packages for your Level</label>
              {studentLevel && (
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Level: {studentLevel}
                </span>
              )}
            </div>

            {isLoadingPricing ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 rounded-xl">
                Loading rates for your level...
              </div>
            ) : pricingList.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">
                No specific package listed for your level yet. Please contact admin or tutor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pricingList.map((pkg) => {
                  const isSelected = selectedPricingId === pkg.id;
                  const perSession = Math.round(Number(pkg.price) / (pkg.sessionsCount || 1));

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPricingId(pkg.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {pkg.hasDiscount && (
                        <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                          {pkg.applicableDiscount?.discountType === 'PERCENTAGE'
                            ? `${pkg.applicableDiscount.value}% OFF`
                            : `Save ${pkg.discountAmount} EGP`}
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{pkg.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {pkg.sessionsCount} {pkg.sessionsCount === 1 ? 'session' : 'sessions'} · ~{perSession} {pkg.currency}/ea
                          </p>
                        </div>
                        <div className="text-right">
                          {pkg.hasDiscount ? (
                            <div>
                              <span className="text-[10px] text-slate-400 line-through block">
                                {Number(pkg.price).toLocaleString()}
                              </span>
                              <span className="font-black text-indigo-700 text-sm">
                                {pkg.finalPrice.toLocaleString()} {pkg.currency}
                              </span>
                            </div>
                          ) : (
                            <span className="font-black text-slate-900 text-sm">
                              {Number(pkg.price).toLocaleString()} {pkg.currency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coupon Code Input */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              <span>Have a Promo or Referral Code?</span>
            </label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-mono font-bold text-emerald-800">{appliedCoupon}</span>
                    <span className="text-[11px] text-emerald-600 ml-2">({customDiscount?.title})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold p-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter discount coupon code..."
                  className="flex-1 text-xs px-3 py-2 bg-white rounded-xl border border-slate-200 font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  disabled={!couponInput.trim() || isApplyingCoupon}
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
                >
                  {isApplyingCoupon ? 'Verifying...' : 'Apply Code'}
                </button>
              </div>
            )}

            {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
          </div>

          {/* Price Breakdown / Summary */}
          {activePackage && (
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Original Package Price:</span>
                <span className="font-semibold">{originalPrice.toLocaleString()} EGP</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>Discount Applied ({activeDiscountCode || 'Level Offer'}):</span>
                  </span>
                  <span>-{discountAmount.toLocaleString()} EGP</span>
                </div>
              )}

              <div className="pt-2 border-t border-indigo-200/60 flex justify-between items-baseline font-bold text-slate-900">
                <span className="text-sm">Total Payable Amount:</span>
                <span className="text-xl font-black text-indigo-700">
                  {finalPayable.toLocaleString()} EGP
                </span>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Select Transfer Method</label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${method.color} text-white flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{method.name}</p>
                          <p className="text-[11px] text-slate-500">{method.instructions}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(method.account);
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg"
                      >
                        {copiedAccount === method.account ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono font-medium text-slate-700 mt-2 bg-white/80 px-2.5 py-1 rounded-md border border-slate-100 select-all">
                      {method.account}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sender details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Sender Mobile / Account</label>
              <input
                required
                type="text"
                value={senderAccountOrPhone}
                onChange={(e) => setSenderAccountOrPhone(e.target.value)}
                placeholder="e.g. 010 1234 5678"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reference / Transaction ID (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN-8829103"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Receipt Screenshot</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {screenshotUrl ? (
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={screenshotUrl}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Screenshot attached
                    </p>
                    <p className="text-[11px] text-slate-500">Click to replace file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Upload Transfer Slip / SMS Screenshot</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, or JPEG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTopUpOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paymentMutation.isPending || !activePackage}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {paymentMutation.isPending ? 'Submitting...' : `Submit Payment (${finalPayable.toLocaleString()} EGP)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
