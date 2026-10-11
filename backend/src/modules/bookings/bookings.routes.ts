import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createBookingSchema,
  cancelBookingSchema,
  createPaymentIntentSchema,
  holdSeatsSchema,
  releaseHoldSchema,
} from './bookings.schema.js';

const router = Router();

router.post('/hold-seats', authenticate, validate(holdSeatsSchema), BookingsController.holdSeats);
router.post('/release-hold', authenticate, validate(releaseHoldSchema), BookingsController.releaseHold);
router.get('/active-hold', authenticate, BookingsController.getActiveHold);
router.post('/create-payment-intent', authenticate, validate(createPaymentIntentSchema), BookingsController.createPaymentIntent);
router.post('/', authenticate, validate(createBookingSchema), BookingsController.create);
router.get('/my', authenticate, BookingsController.getUserBookings);
router.get('/tickets/:ticketNumber', BookingsController.getTicketView);
router.get('/:reference', optionalAuthenticate, BookingsController.getByReference);
router.post('/:id/cancel', authenticate, validate(cancelBookingSchema), BookingsController.cancel);

export const bookingRoutes = router;