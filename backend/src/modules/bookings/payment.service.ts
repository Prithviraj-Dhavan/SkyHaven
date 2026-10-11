import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export interface CreateIntentInput {
  amount: number; // in the main currency unit (rupees, not paise)
  currency?: string;
}

export interface VerifiedPayment {
  success: boolean;
  transactionRef: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED";
  paymentMethod: string;
  cardLast4?: string;
  processedAt: Date;
}

export class PaymentService {
  /**
   * Step 1 of real payment flow: ask Stripe to open a PaymentIntent
   * and hand back the client_secret the frontend needs to collect
   * real card details securely (card number never touches our server).
   */
    public static async createPaymentIntent(input: CreateIntentInput) {
    const currency = (input.currency || 'inr').toLowerCase();
    const amountInSmallestUnit = Math.round(input.amount * 100); // paise for INR

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency,
      payment_method_types: ['card', 'upi'],
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Step 2: called by BookingsService right before creating the booking.
   * Re-fetches the PaymentIntent directly from Stripe's servers — never
   * trusts anything the frontend claims about payment status or amount.
   */
  public static async verifyPayment(
    paymentIntentId: string,
    expectedAmount: number,
    expectedCurrency = "inr",
  ): Promise<VerifiedPayment> {
    if (!paymentIntentId) {
      throw new Error("Missing paymentIntentId");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new Error(
        `Payment not completed. Current status: ${paymentIntent.status}`,
      );
    }

    const expectedAmountInSmallestUnit = Math.round(expectedAmount * 100);
    if (paymentIntent.amount !== expectedAmountInSmallestUnit) {
      throw new Error("Payment amount does not match booking total");
    }

    if (paymentIntent.currency !== expectedCurrency.toLowerCase()) {
      throw new Error("Payment currency mismatch");
    }

    let cardLast4: string | undefined;
    let paymentMethodType = "CARD";

    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(
        paymentIntent.latest_charge as string,
      );
      cardLast4 = charge.payment_method_details?.card?.last4 ?? undefined;
      paymentMethodType =
        charge.payment_method_details?.type?.toUpperCase() || "CARD";
    }

    return {
      success: true,
      transactionRef: paymentIntent.id,
      amount: expectedAmount,
      currency: expectedCurrency.toUpperCase(),
      status: "SUCCESS",
      paymentMethod: paymentMethodType,
      cardLast4,
      processedAt: new Date(),
    };
  }

  public static async processRefund(transactionRef: string, amount: number) {
    const refund = await stripe.refunds.create({
      payment_intent: transactionRef,
      amount: Math.round(amount * 100),
    });

    return {
      success: refund.status === "succeeded" || refund.status === "pending",
      refundRef: refund.id,
      originalTransactionRef: transactionRef,
      refundAmount: amount,
      status: "REFUNDED" as const,
    };
  }
}
