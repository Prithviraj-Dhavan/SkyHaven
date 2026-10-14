import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useCountdown, formatTimer } from '../../hooks';

const STRIPE_PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51UJDQEAXK1mA6AYahqxkyGQD3qx1mmR4Ua9DvHia7xdBoFe3tXFh1NqFfoXbt1TfT2gdNoV9JhATB5gMuSc9hbGP001pFzRDzo';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

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
  clientSecret: string;
  onConfirmPayment: (paymentDetails: { paymentIntentId: string }) => Promise<void>;
  isLoading: boolean;
}> = ({ totalAmount, secondsLeft, clientSecret, onConfirmPayment, isLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isElementReady, setIsElementReady] = useState(false);
  const [elementError, setElementError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roundedAmount = Math.round(totalAmount);

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

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please check your card information.');
        setIsVerifying(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        await onConfirmPayment({ paymentIntentId: paymentIntent.id });
      } else {
        setError('Payment was not completed. Status: ' + (paymentIntent?.status || 'unknown'));
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while confirming payment.');
    } finally {
      setIsVerifying(false);
    }
  };


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

      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#02122c] border border-slate-200 dark:border-slate-800 relative min-h-[140px] flex flex-col justify-center">
        {!isElementReady && !elementError && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-7 h-7 rounded-full border-3 border-[#0062E3] border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono">
              Loading payment options...
            </span>
          </div>
        )}

        {elementError ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Stripe Elements could not be loaded</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              An ad-blocker, browser tracking protection, or network issue prevented the Stripe iframe from loading.
              Please check your network connection or try disabling blocking extensions.
            </p>
          </div>
        ) : (
          <PaymentElement
            onReady={() => setIsElementReady(true)}
            onLoadError={(e) => {
              console.warn('Stripe load error:', e);
              setElementError(e.error?.message || 'Could not load Stripe form');
            }}
          />
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isVerifying ? (
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-[#0062E3]/40 text-center space-y-2">
          <div className="w-7 h-7 rounded-full border-3 border-[#0062E3] border-t-transparent animate-spin mx-auto" />
          <div className="text-xs font-bold text-[#0062E3] dark:text-[#00B2D6] font-mono">
            Processing payment transaction...
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {!elementError && (
            <button
              type="button"
              onClick={handlePay}
              disabled={isLoading || !stripe || !isElementReady || secondsLeft <= 0}
              className="w-full py-3.5 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Pay ₹{roundedAmount.toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
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
  const roundedAmount = Math.round(totalAmount);

  // If mock client secret is used (e.g. backend fallback)
  const isMockSecret = clientSecret?.startsWith('mock_');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title="Complete Your Flight Reservation"
      subtitle="Your seats are held for 5 minutes — secure payment powered by Stripe"
    >
      {clientSecret ? (
        !isMockSecret && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0062E3',
                  borderRadius: '12px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
              },
            }}
          >
            <CheckoutForm
              totalAmount={totalAmount}
              secondsLeft={secondsLeft}
              clientSecret={clientSecret}
              onConfirmPayment={onConfirmPayment}
              isLoading={isLoading}
            />
          </Elements>
        ) : (
          <div className="space-y-5">
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600/10 via-[#0062E3]/15 to-teal-500/10 border border-[#0062E3]/30 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0062E3] dark:text-[#00B2D6] font-mono">
                  Total Fare Payable
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <span>₹</span>
                  <span>{roundedAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Seats held: {formatTimer(secondsLeft)}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Demo Test Gateway Ready
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Your flight itinerary and seats are held. Click below to instantly confirm your reservation and generate tickets.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onConfirmPayment({ paymentIntentId: clientSecret.replace('_secret_test', '') })}
              disabled={isLoading || secondsLeft <= 0}
              className="w-full py-3.5 rounded-2xl bg-[#0062E3] hover:bg-[#0051c7] text-white font-black text-sm tracking-wide shadow-sky-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Confirm & Pay ₹{roundedAmount.toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )
      ) : (
        <div className="p-8 text-center text-sm text-slate-500 space-y-3">
          <div className="w-6 h-6 rounded-full border-2 border-[#0062E3] border-t-transparent animate-spin mx-auto" />
          <div>Setting up secure payment session...</div>
        </div>
      )}
    </Modal>
  );
};