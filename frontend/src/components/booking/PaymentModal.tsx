import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useCountdown, formatTimer } from '../../hooks';

const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  clientSecret: string | null;
  holdExpiresAt: string | null;
  onHoldExpired: () => void;
  onConfirmPayment: (paymentDetails: { paymentIntentId: string }) => Promise<void>;
  isLoading: boolean;
}

const CheckoutForm: React.FC<{
  totalAmount: number;
  secondsLeft: number;
  onConfirmPayment: (paymentDetails: { paymentIntentId: string }) => Promise<void>;
  isLoading: boolean;
}> = ({ totalAmount, secondsLeft, onConfirmPayment, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setIsVerifying(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Please check your payment details.');
      setIsVerifying(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please try again.');
      setIsVerifying(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      await onConfirmPayment({ paymentIntentId: paymentIntent.id });
    } else {
      setError('Payment was not completed.');
    }

    setIsVerifying(false);
  };

  const roundedAmount = Math.round(totalAmount);

  return (
    <div className="space-y-5">
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600/10 via-[#0062E3]/15 to-teal-500/10 border border-[#0062E3]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#0062E3] dark:text-[#00B2D6] font-mono">
            Total Fare Payable
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
            <span>₹</span>
            <span>{roundedAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#0062E3]/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secured by Stripe</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            <span>Seats held: {formatTimer(secondsLeft)}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#000000] border border-slate-200 dark:border-slate-800">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {isVerifying ? (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-[#0062E3]/40 text-center space-y-2">
          <div className="w-7 h-7 rounded-full border-3 border-[#0062E3] border-t-transparent animate-spin mx-auto" />
          <div className="text-xs font-bold text-[#0062E3] dark:text-[#00B2D6] font-mono">
            Confirming payment with Stripe...
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handlePay}
          disabled={isLoading || !stripe || secondsLeft <= 0}
          className="w-full py-3.5 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Pay ₹{roundedAmount.toLocaleString('en-IN')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  clientSecret,
  holdExpiresAt,
  onHoldExpired,
  onConfirmPayment,
  isLoading,
}) => {
  const secondsLeft = useCountdown(holdExpiresAt, isOpen, onHoldExpired);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Complete Your Flight Reservation"
      subtitle="Your seats are held for 5 minutes — secure card/UPI payment powered by Stripe"
    >
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            totalAmount={totalAmount}
            secondsLeft={secondsLeft}
            onConfirmPayment={onConfirmPayment}
            isLoading={isLoading}
          />
        </Elements>
      ) : (
        <div className="p-8 text-center text-sm text-slate-500">
          Setting up secure payment...
        </div>
      )}
    </Modal>
  );
};