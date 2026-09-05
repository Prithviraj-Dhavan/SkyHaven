import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { flightCreateSchema, flightUpdateSchema } from '../flights/flights.schema.js';

const router = Router();

// All routes in admin require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', AdminController.getStats);
router.get('/flights', AdminController.getFlights);
router.get('/bookings', AdminController.getBookings);
router.post('/flights', validate(flightCreateSchema), AdminController.createFlight);
router.patch('/flights/:id', validate(flightUpdateSchema), AdminController.updateFlight);
router.delete('/flights/:id', AdminController.deleteFlight);

export const adminRoutes = router;
