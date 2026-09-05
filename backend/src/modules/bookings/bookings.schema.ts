import { z } from 'zod';

export const passengerSchema = z.object({
  name: z.string().min(2, 'Passenger name is required'),
  email: z.string().email('Valid passenger email is required'),
  documentNumber: z.string().min(4, 'Passport/Govt ID is required'),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']).default('ADULT'),
  seatId: z.string().uuid('Valid seat ID is required'),
});

export const createBookingSchema = z.object({
  body: z.object({
    flightId: z.string().uuid('Valid flight ID is required'),
    passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
    payment: z.object({
      provider: z.string().default('MOCK_STRIPE'),
      paymentMethod: z.enum(['CREDIT_CARD', 'UPI', 'NET_BANKING', 'WALLET']).default('CREDIT_CARD'),
      cardLast4: z.string().optional().default('4242'),
    }),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
