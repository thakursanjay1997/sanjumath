import React, { useState } from 'react';
import { PaymentSettings } from '../types';
import { CreditCard, Check, Sparkles, ArrowLeft, X, ShieldCheck, Tag } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: number;
  packageType: 'math' | 'physics' | 'combo';
  baseFee: number;
  paymentSettings: PaymentSettings;
  defaultStudentName: string;
  defaultStudentEmail: string;
  defaultStudentPhone: string;
  onApplyCoupon: (code: string, originalFee: number) => Promise<{ discountAmount: number; finalFee: number; coupon: any }>;
  onSubmitPayment: (payload: {
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    grade: number;
    courseName: string;
    fee: number;
    utr: string;
    couponCode?: string;
  }) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  grade,
  packageType,
  baseFee,
  paymentSettings,
  defaultStudentName,
  defaultStudentEmail,
  defaultStudentPhone,
  onApplyCoupon,
  onSubmitPayment,
  onShowToast
}) => {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [studentPhone, setStudentPhone] = useState(defaultStudentPhone || '9822011223');
  const [studentEmail, setStudentEmail] = useState(defaultStudentEmail || 'student@gmail.com');
  const [utr, setUtr] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [currentFee, setCurrentFee] = useState(baseFee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Sync fee if baseFee changes
  React.useEffect(() => {
    setCurrentFee(baseFee);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setIsSubmittedSuccess(false);
  }, [baseFee, isOpen]);

  if (!isOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      onShowToast('Please enter a coupon code.');
      return;
    }
    try {
      const res = await onApplyCoupon(couponCode.trim(), baseFee);
      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discountAmount);
      setCurrentFee(res.finalFee);
      onShowToast(`✓ Coupon applied! Saved ₹${res.discountAmount.toLocaleString()}`);
    } catch (err: any) {
      onShowToast(err.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCurrentFee(baseFee);
    setCouponCode('');
    onShowToast('Coupon removed.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      onShowToast('Please enter student name for receipt.');
      return;
    }
    if (!utr.trim()) {
      onShowToast('Please enter Transaction UTR or PhonePe Number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitPayment({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        studentPhone: studentPhone.trim(),
        grade,
        courseName: `Class ${grade} Comprehensive Batch (${packageType.toUpperCase()})`,
        fee: currentFee,
        utr: utr.trim(),
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });
      setIsSubmittedSuccess(true);
      onShowToast('✓ Payment submitted for Owner verification!');
    } catch (err: any) {
      onShowToast(err.message || 'Payment submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiUrl = `upi://pay?pa=${paymentSettings.upi}&pn=Bhimsingh%20Thakur&am=${currentFee}&cu=INR&tn=SanjuMath_Class${grade}${
    appliedCoupon ? `_${appliedCoupon.code}` : ''
  }`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-[#090e1f] via-[#121936] to-[#080d1e] border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl relative space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-700/80">
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <span className="text-xs font-black text-amber-400 tracking-wider font-heading">
            ENROLLMENT CHECKOUT
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSubmittedSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Batch Info Card */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div>
                <h4 className="font-heading text-lg font-black text-white">
                  Class {grade} Comprehensive CBSE Batch
                </h4>
                <p className="text-xs text-slate-400">
                  Pure Mathematics & Applied Physics with Bhimsingh Thakur (M.Sc.)
                </p>
              </div>

              {/* Coupon Input */}
              <div className="pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-amber-400 block mb-1">
                  Have a Promo / Discount Coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SANJU10, TOPPER20"
                    disabled={!!appliedCoupon}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono uppercase tracking-wider rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-xl"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="mt-2 p-2 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Code <strong>{appliedCoupon.code}</strong> Applied: Saved <strong>₹{discountAmount.toLocaleString()}</strong>!
                    </span>
                  </div>
                )}
              </div>

              {/* Fee Row */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Total Payable Fee:</span>
                  {appliedCoupon && (
                    <span className="text-xs text-rose-400 line-through">
                      ₹{baseFee.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="font-heading font-black text-2xl text-amber-400">
                  ₹{currentFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Dynamic UPI QR Code */}
            <div className="text-center bg-white p-3.5 rounded-2xl max-w-[190px] mx-auto shadow-2xl">
              <img
                src={qrCodeUrl}
                alt="Payment QR"
                className="w-40 h-40 mx-auto object-contain block"
              />
              <span className="text-[10px] text-slate-900 font-extrabold block mt-1">
                Scan with PhonePe / GPay / Paytm
              </span>
            </div>

            {/* Direct Payee Credentials */}
            <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payee Name:</span>
                <strong className="text-white font-bold">{paymentSettings.accountHolder}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">PhonePe / GPay:</span>
                <strong className="text-amber-400 font-mono font-bold">+91 {paymentSettings.phone}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">UPI ID:</span>
                <strong className="text-sky-400 font-mono font-bold">{paymentSettings.upi}</strong>
              </div>
            </div>

            {/* Student & Transaction Input Fields */}
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student name for admission receipt"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Transaction ID / UTR or Payer Mobile *</label>
                <input
                  type="text"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 423985123984 or 9822011223"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Required by Bhimsingh Sir to match bank statement and unlock batch.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting to Directorate...' : '✓ I Have Paid — Submit for Owner Verification'}
            </button>
          </form>
        ) : (
          /* Submitted Pending View */
          <div className="text-center py-6 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl">
              ⏳
            </div>
            <h3 className="font-heading text-xl font-black text-amber-300">
              Payment Under Review by Owner
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Thank you! Your payment details for <strong className="text-amber-400">Class {grade}</strong> have been forwarded directly to <strong>Bhimsingh Thakur (Owner & Directorate Desk)</strong>. As soon as your fee is verified, your batch and live classroom will automatically unlock.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs py-3 rounded-xl shadow-md mt-2"
            >
              Go to Student Portal & Explore Syllabus →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
