import { z } from 'zod';

export const flightSearchSchema = z.object({
  query: z.object({
    origin: z.string().optional(),
    destination: z.string().optional(),
    departureDate: z.string().optional(), // YYYY-MM-DD
    returnDate: z.string().optional(),
    passengers: z.string().optional().default('1').transform(Number),
    cabinClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).optional().default('ECONOMY'),
    maxPrice: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    airlines: z.string().optional(), // comma separated
    sortBy: z.enum(['best', 'price_asc', 'price_desc', 'duration_asc', 'departure_asc']).optional().default('best'),
    timeOfDay: z.string().optional(),
    stops: z.string().optional(),
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('20').transform(Number),
  }),
});

export const flightCreateSchema = z.object({
  body: z.object({
    flight_number: z.string().min(3),
    airline: z.string().min(2),
    origin_airport_id: z.string().uuid(),
    destination_airport_id: z.string().uuid(),
    departure_time: z.string().datetime(),
    arrival_time: z.string().datetime(),
    base_price: z.number().positive(),
    aircraft_type: z.string().min(2),
    duration_minutes: z.number().int().positive(),
    gate: z.string().optional(),
    terminal: z.string().optional(),
  }),
});

export const flightUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    flight_number: z.string().min(3).optional(),
    airline: z.string().min(2).optional(),
    departure_time: z.string().datetime().optional(),
    arrival_time: z.string().datetime().optional(),
    base_price: z.number().positive().optional(),
    aircraft_type: z.string().min(2).optional(),
    duration_minutes: z.number().int().positive().optional(),
    gate: z.string().optional(),
    terminal: z.string().optional(),
    status: z.enum(['SCHEDULED', 'DELAYED', 'DEPARTED', 'COMPLETED', 'CANCELLED']).optional(),
  }),
});

export type FlightSearchQuery = z.infer<typeof flightSearchSchema>['query'];
export type FlightCreateInput = z.infer<typeof flightCreateSchema>['body'];
export type FlightUpdateInput = z.infer<typeof flightUpdateSchema>['body'];
