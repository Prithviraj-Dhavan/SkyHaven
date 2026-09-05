import { Router } from 'express';
import { FlightsController } from './flights.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { flightSearchSchema } from './flights.schema.js';

const router = Router();

router.get('/search', validate(flightSearchSchema), FlightsController.search);
router.get('/airports', FlightsController.getAirports);
router.get('/deals', FlightsController.getDeals);
router.get('/:id', FlightsController.getById);

export const flightRoutes = router;
