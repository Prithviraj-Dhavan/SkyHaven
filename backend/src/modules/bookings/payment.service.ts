import crypto from 'crypto';

export interface PaymentProcessInput {
  amount: number;
  currency?: string;
  provider: string;
  paymentMethod: string;
  cardLast4?: string;
}

export class PaymentService {
  public static async processPayment(input: PaymentProcessInput) {
    // Simulate real-time gateway latency (e.g. 50ms)
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Generate unique transaction reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const transactionRef = `TXN-${timestamp}-${randomHex}`;

    return {
      success: true,
      transactionRef,
      amount: input.amount,
      currency: input.currency || 'USD',
      status: 'SUCCESS' as const,
      paymentMethod: input.paymentMethod,
      cardLast4: input.cardLast4 || '4242',
      processedAt: new Date(),
    };
  }

  public static async processRefund(transactionRef: string, amount: number) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      success: true,
      refundRef: `REF-${Date.now().toString(36).toUpperCase()}`,
      originalTransactionRef: transactionRef,
      refundAmount: amount,
      status: 'REFUNDED' as const,
    };
  }
}
