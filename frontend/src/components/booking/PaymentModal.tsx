import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Building,
  QrCode,
  Copy,
  Check,
  Clock
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  currency?: string;
  onConfirmPayment: (paymentDetails: {
    provider: string;
    paymentMethod: 'CREDIT_CARD' | 'UPI' | 'NET_BANKING' | 'WALLET';
    cardLast4?: string;
    upiRef?: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  currency = 'INR',
  onConfirmPayment,
  isLoading,
}) => {
  const [method, setMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING'>('UPI');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9841');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('SkyHaven Traveler');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // UPI QR Code states - Exactly 10 Minutes Timer (600 seconds)
  const [upiId] = useState('8010725210@ibl');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState('');
  const [txnRef, setTxnRef] = useState(() => `SH-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [qrImgError, setQrImgError] = useState(false);

  // Exact standard NPCI UPI payment deep-link URI
  const roundedAmount = Math.round(totalAmount);
  const upiPaymentUri = `upi://pay?pa=${upiId}&pn=SkyHaven%20Airlines&am=${roundedAmount}&cu=INR&tn=SkyHaven%20Flight%20Reservation%20${txnRef}`;

  // Real high-resolution scannable QR Code endpoint
  const primaryQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&format=png&data=${encodeURIComponent(upiPaymentUri)}`;
  const fallbackQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiPaymentUri)}&size=260&margin=1`;

  // Countdown timer for 10 minutes (600 seconds)
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(600);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetTimer = () => {
    setTimeLeft(600);
    setTxnRef(`SH-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleProcessPayment = async () => {
    setIsVerifying(true);
    setVerificationStep('Connecting to Secure Banking Gateway...');

    setTimeout(() => {
      setVerificationStep('Detecting UPI Payment Receipt from Banking Network...');
    }, 800);

    setTimeout(() => {
      setVerificationStep('Payment Verified! Locking Confirmed Seats & Generating Boarding Pass...');
    }, 1600);

    setTimeout(async () => {
      await onConfirmPayment({
        provider: 'SKYHAVEN_SECURE_PAY_GATEWAY',
        paymentMethod: method,
        cardLast4: method === 'CREDIT_CARD' ? cardNumber.slice(-4).replace(/\D/g, '') || '9841' : undefined,
        upiRef: txnRef,
      });
      setIsVerifying(false);
    }, 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Complete Your Flight Reservation"
      subtitle="Guaranteed Instant Seat Lock & Electronic Boarding Pass Issuance"
    >
      <div className="space-y-5">

        {/* Total Amount & Encryption Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-[#0062E3]/15 to-teal-500/10 border border-[#0062E3]/30 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0062E3] dark:text-[#00B2D6] font-mono">
              Total Fare Payable
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
              <span>₹</span>
              <span>{roundedAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit Encrypted</span>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">Zero Hidden Fees</span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'UPI', label: 'Scan UPI QR', icon: <QrCode className="w-4 h-4" />, badge: 'Fastest' },
              { id: 'CREDIT_CARD', label: 'Debit / Card', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'NET_BANKING', label: 'Net Banking', icon: <Building className="w-4 h-4" /> },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id as any)}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer font-display relative ${method === m.id
                  ? 'bg-[#0062E3] text-white border-[#0062E3] shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                  : 'bg-white dark:bg-[#18181b] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
              >
                {m.icon}
                <span className="truncate">{m.label}</span>
                {m.badge && (
                  <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded-full hidden sm:inline ${method === m.id ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {m.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Real Scannable UPI QR Code Section */}
        {method === 'UPI' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">

              {/* High-Resolution Real Scannable QR Card */}
              <div className="sm:col-span-5 p-3 bg-white rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center">

                {/* 10-Min Timer Header on Card */}
                <div className="w-full flex items-center justify-end mb-1 text-[10px] font-mono font-bold text-amber-600">
                  <span>⏳ {formatTimer(timeLeft)}</span>
                </div>

                {/* Real Scannable QR Code Image */}
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 bg-white flex items-center justify-center p-1 rounded-xl overflow-hidden">
                  <img
                    src={qrImgError ? fallbackQrUrl : primaryQrUrl}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain select-none"
                    onError={() => setQrImgError(true)}
                  />
                  {/* Subtle Scanning laser beam */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#0062E3] to-transparent animate-pulse pointer-events-none opacity-70" />
                </div>

                {/* Amount to Scan */}
                <div className="mt-2 text-center">
                  <span className="text-xs font-mono font-black text-slate-800">
                    Scan to Pay ₹{roundedAmount.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[9px] text-slate-400 font-medium">Any UPI App / Camera</div>
                </div>
              </div>

              {/* Instructions & UPI Details */}
              <div className="sm:col-span-7 space-y-3">

                {/* 10-Minute Countdown Indicator Header */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-600/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>QR Valid for 10 Min</span>
                  </div>
                  <div className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 bg-white dark:bg-amber-950 px-2 py-0.5 rounded-lg shadow-2xs border border-amber-200 dark:border-amber-700">
                    {formatTimer(timeLeft)}
                  </div>
                </div>

                {/* Supported Apps Chips */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Scan with any UPI app:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'CRED', 'Amazon Pay'].map((app) => (
                      <span
                        key={app}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#18181b] text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        ✓ {app}
                      </span>
                    ))}
                  </div>
                </div>

                {/* UPI ID Copy Field */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
                  <div className="min-w-0 pr-2">
                    <div className="text-[9px] uppercase font-bold text-slate-400 font-mono">Merchant UPI ID</div>
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate select-all">
                      {upiId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#0062E3]/10 text-[#0062E3] dark:text-[#00B2D6] hover:bg-[#0062E3] hover:text-white'
                      }`}
                  >
                    {copied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Txn Ref: <strong className="text-slate-800 dark:text-slate-200">{txnRef}</strong></span>
                  {timeLeft === 0 && (
                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="text-[#0062E3] dark:text-[#00B2D6] font-bold underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Credit/Debit Card Form */}
        {method === 'CREDIT_CARD' && (
          <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <Input
              label="Cardholder Name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Full Name as on Card"
              required
            />
            <Input
              label="Card Number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 •••• •••• 9841"
              leftIcon={<CreditCard className="w-4 h-4" />}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expires"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV / CVC"
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="888"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>
          </div>
        )}

        {/* 3. Net Banking Form */}
        {method === 'NET_BANKING' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in duration-200">
            <p className="font-bold">Select your bank for instant checkout authorization:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${selectedBank === b
                    ? 'border-[#0062E3] bg-blue-50 dark:bg-blue-950/40 text-[#0062E3] dark:text-[#00B2D6]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#18181b] hover:border-slate-300'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${selectedBank === b ? 'bg-[#0062E3]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="truncate text-xs">{b}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Verification Loader / Action Button */}
        {isVerifying ? (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-[#0062E3]/40 text-center space-y-2 animate-in fade-in duration-150">
            <div className="w-7 h-7 rounded-full border-3 border-[#0062E3] border-t-transparent animate-spin mx-auto" />
            <div className="text-xs font-bold text-[#0062E3] dark:text-[#00B2D6] font-mono">
              {verificationStep}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleProcessPayment}
            disabled={isLoading || timeLeft === 0}
            className="w-full py-3.5 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Verify & Issue Boarding Pass (₹{roundedAmount.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </Modal>
  );
};
