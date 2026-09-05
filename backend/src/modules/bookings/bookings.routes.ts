import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBookingSchema, cancelBookingSchema } from './bookings.schema.js';

const router = Router();

router.post('/', authenticate, validate(createBookingSchema), BookingsController.create);
router.get('/my', authenticate, BookingsController.getUserBookings);
router.get('/tickets/:ticketNumber', BookingsController.getTicketView);
router.get('/:reference', optionalAuthenticate, BookingsController.getByReference);
router.post('/:id/cancel', authenticate, validate(cancelBookingSchema), BookingsController.cancel);

export const bookingRoutes = router;
