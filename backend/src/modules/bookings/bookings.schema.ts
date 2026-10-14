import { z } from 'zod';

export const passengerSchema = z.object({
  name: z.string().min(2, 'Passenger name is required'),
  email: z.string().email('Valid passenger email is required'),
  documentNumber: z.string().optional().default(''),
  type: z.enum(['ADULT', 'CHILD', 'INFANT']).default('ADULT'),
  seatId: z.string().uuid('Valid seat ID is required'),
});

export const holdSeatsSchema = z.object({
  body: z.object({
    seatIds: z.array(z.string().uuid()).min(1, 'At least one seat is required'),
  }),
});

export const releaseHoldSchema = z.object({
  body: z.object({
    seatIds: z.array(z.string().uuid()).optional(),
  }).optional(),
});

export const createPaymentIntentSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than zero'),
    currency: z.string().optional().default('inr'),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    flightId: z.string().uuid('Valid flight ID is required'),
    passengers: z.array(passengerSchema).min(1, 'At least one passenger is required'),
    returnFlightId: z.string().uuid().optional(),
    returnPassengers: z.array(passengerSchema).optional(),
    payment: z.object({
      paymentIntentId: z.string().min(1, 'paymentIntentId is required'),
    }),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>['body'];
export type HoldSeatsInput = z.infer<typeof holdSeatsSchema>['body'];