import { prisma } from '../../config/database.js';
import { cache } from '../../config/redis.js';
import { AppError } from '../../middleware/error.middleware.js';
import { FlightSearchQuery, FlightCreateInput, FlightUpdateInput } from './flights.schema.js';
import { Prisma } from '@prisma/client';

export class FlightsService {
  public static async searchFlights(query: FlightSearchQuery) {
    const cacheKey = `search:${JSON.stringify(query)}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch {
        // Fallback to query
      }
    }

    const where: Prisma.FlightWhereInput = {
      status: { not: 'CANCELLED' },
    };

    // 1. Origin filter (by IATA code or City Name)
    if (query.origin && query.origin.trim() !== '') {
      const orig = query.origin.trim();
      where.origin_airport = {
        OR: [
          { code: { equals: orig } },
          { name: { contains: orig } },
          { city: { name: { contains: orig } } },
        ],
      };
    }

    // 2. Destination filter
    if (query.destination && query.destination.trim() !== '') {
      const dest = query.destination.trim();
      where.destination_airport = {
        OR: [
          { code: { equals: dest } },
          { name: { contains: dest } },
          { city: { name: { contains: dest } } },
        ],
      };
    }

    // 3. Departure Date filter (optional query)
    if (query.departureDate && query.departureDate.trim() !== '') {
      const startOfDay = new Date(query.departureDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(query.departureDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if flights exist for this date
      const dateCount = await prisma.flight.count({
        where: {
          ...where,
          departure_time: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (dateCount > 0) {
        where.departure_time = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    // 4. Max Price filter
    if (query.maxPrice && query.maxPrice > 0) {
      where.base_price = {
        lte: query.maxPrice,
      };
    }

    // 5. Airline filter
    if (query.airlines) {
      const airlineList = query.airlines.split(',').map((a) => a.trim());
      if (airlineList.length > 0) {
        where.airline = { in: airlineList };
      }
    }

    // Sorting
    let orderBy: Prisma.FlightOrderByWithRelationInput = { base_price: 'asc' };
    if (query.sortBy === 'price_desc') orderBy = { base_price: 'desc' };
    else if (query.sortBy === 'duration_asc') orderBy = { duration_minutes: 'asc' };
    else if (query.sortBy === 'departure_asc') orderBy = { departure_time: 'asc' };

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, query.limit || 20);
    const skip = (page - 1) * limit;

    const [flights, totalCount] = await Promise.all([
      prisma.flight.findMany({
        where,
        include: {
          origin_airport: {
            include: { city: true },
          },
          destination_airport: {
            include: { city: true },
          },
          seats: {
            where: {
              cabin_class: query.cabinClass || 'ECONOMY',
              is_booked: false,
            },
            select: { id: true, price_modifier: true },
          },
          _count: {
            select: {
              seats: {
                where: { is_booked: false },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.flight.count({ where }),
    ]);

    // Format results with cabin pricing and available seats
    const targetCabin = query.cabinClass || 'ECONOMY';
    const formattedFlights = flights.map((f) => {
      const cabinSeats = f.seats;
      const avgPriceModifier = cabinSeats.length > 0 ? Number(cabinSeats[0].price_modifier) : 0;
      const effectivePrice = Number(f.base_price) + avgPriceModifier;

      let depTime = f.departure_time;
      let arrTime = f.arrival_time;

      if (query.departureDate && query.departureDate.trim() !== '') {
        const [y, m, d] = query.departureDate.split('-').map(Number);
        if (y && m && d) {
          const projectedDep = new Date(f.departure_time);
          projectedDep.setFullYear(y, m - 1, d);
          depTime = projectedDep;
          arrTime = new Date(projectedDep.getTime() + f.duration_minutes * 60000);
        }
      }

      return {
        id: f.id,
        flightNumber: f.flight_number,
        airline: f.airline,
        aircraftType: f.aircraft_type,
        origin: {
          code: f.origin_airport.code,
          name: f.origin_airport.name,
          city: f.origin_airport.city.name,
          country: f.origin_airport.city.country,
        },
        destination: {
          code: f.destination_airport.code,
          name: f.destination_airport.name,
          city: f.destination_airport.city.name,
          country: f.destination_airport.city.country,
        },
        departureTime: depTime,
        arrivalTime: arrTime,
        durationMinutes: f.duration_minutes,
        basePrice: Number(f.base_price),
        effectivePrice,
        cabinClass: targetCabin,
        availableSeatsCount: f._count.seats,
        availableCabinSeatsCount: cabinSeats.length,
        gate: f.gate,
        terminal: f.terminal,
        status: f.status,
      };
    });

    const response = {
      flights: formattedFlights,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // Cache for 60 seconds
    await cache.set(cacheKey, JSON.stringify(response), 60);

    return response;
  }

  public static async getFlightById(flightId: string) {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        origin_airport: { include: { city: true } },
        destination_airport: { include: { city: true } },
        seats: {
          orderBy: [{ row: 'asc' }, { column: 'asc' }],
        },
      },
    });

    if (!flight) {
      throw new AppError('Flight not found', 404, 'FLIGHT_NOT_FOUND');
    }

    const seats = flight.seats.map((s) => ({
      id: s.id,
      seatNumber: s.seat_number,
      cabinClass: s.cabin_class,
      isBooked: s.is_booked,
      priceModifier: Number(s.price_modifier),
      row: s.row,
      column: s.column,
      isExitRow: s.is_exit_row,
      totalPrice: Number(flight.base_price) + Number(s.price_modifier),
    }));

    return {
      id: flight.id,
      flightNumber: flight.flight_number,
      airline: flight.airline,
      aircraftType: flight.aircraft_type,
      durationMinutes: flight.duration_minutes,
      departureTime: flight.departure_time,
      arrivalTime: flight.arrival_time,
      basePrice: Number(flight.base_price),
      gate: flight.gate,
      terminal: flight.terminal,
      status: flight.status,
      origin: {
        code: flight.origin_airport.code,
        name: flight.origin_airport.name,
        city: flight.origin_airport.city.name,
        country: flight.origin_airport.city.country,
      },
      destination: {
        code: flight.destination_airport.code,
        name: flight.destination_airport.name,
        city: flight.destination_airport.city.name,
        country: flight.destination_airport.city.country,
      },
      seats,
    };
  }

  public static async getAirportsAndCities() {
    const cacheKey = 'airports:all';
    const cached = await cache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback
      }
    }

    const airports = await prisma.airport.findMany({
      include: { city: true },
      orderBy: { code: 'asc' },
    });

    const formatted = airports.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      cityName: a.city.name,
      country: a.city.country,
      cityImage: a.city.image_url,
    }));

    await cache.set(cacheKey, JSON.stringify(formatted), 3600);
    return formatted;
  }

  public static async getFeaturedDeals() {
    const cacheKey = 'featured:deals';
    const cached = await cache.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback
      }
    }

    const popularAirports = ['DEL', 'BOM', 'GOI', 'BLR', 'DXB', 'LHR', 'SIN', 'JFK', 'HND'];
    const flights = await prisma.flight.findMany({
      where: {
        status: 'SCHEDULED',
        departure_time: { gte: new Date() },
        origin_airport: { code: { in: popularAirports } },
        destination_airport: { code: { in: popularAirports } },
      },
      include: {
        origin_airport: { include: { city: true } },
        destination_airport: { include: { city: true } },
      },
      orderBy: { base_price: 'asc' },
      take: 8,
    });

    const deals = flights.map((f) => ({
      id: f.id,
      flightNumber: f.flight_number,
      airline: f.airline,
      originCity: f.origin_airport.city.name,
      originCode: f.origin_airport.code,
      destCity: f.destination_airport.city.name,
      destCode: f.destination_airport.code,
      destImage: f.destination_airport.city.image_url,
      departureTime: f.departure_time,
      price: Number(f.base_price),
      durationMinutes: f.duration_minutes,
    }));

    await cache.set(cacheKey, JSON.stringify(deals), 300);
    return deals;
  }

  public static async createFlight(input: FlightCreateInput) {
    const flight = await prisma.flight.create({
      data: {
        flight_number: input.flight_number,
        airline: input.airline,
        origin_airport_id: input.origin_airport_id,
        destination_airport_id: input.destination_airport_id,
        departure_time: new Date(input.departure_time),
        arrival_time: new Date(input.arrival_time),
        base_price: input.base_price,
        aircraft_type: input.aircraft_type,
        duration_minutes: input.duration_minutes,
        gate: input.gate,
        terminal: input.terminal,
        status: 'SCHEDULED',
      },
      include: {
        origin_airport: { include: { city: true } },
        destination_airport: { include: { city: true } },
      },
    });

    const seatsData: any[] = [];
    for (let row = 1; row <= 12; row++) {
      let cabinClass = 'ECONOMY';
      let priceModifier = 0;
      if (row <= 2) {
        cabinClass = 'FIRST';
        priceModifier = 15000;
      } else if (row <= 5) {
        cabinClass = 'BUSINESS';
        priceModifier = 8500;
      } else if (row <= 7) {
        cabinClass = 'PREMIUM_ECONOMY';
        priceModifier = 3200;
      }

      for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
        seatsData.push({
          flight_id: flight.id,
          seat_number: `${row}${col}`,
          cabin_class: cabinClass,
          price_modifier: priceModifier,
          row,
          column: col,
          is_exit_row: row === 6,
          is_booked: false,
        });
      }
    }

    await prisma.seat.createMany({ data: seatsData });
    await cache.del('featured:deals');
    return flight;
  }

  public static async updateFlight(id: string, input: FlightUpdateInput) {
    const flight = await prisma.flight.update({
      where: { id },
      data: {
        ...(input.flight_number && { flight_number: input.flight_number }),
        ...(input.airline && { airline: input.airline }),
        ...(input.departure_time && { departure_time: new Date(input.departure_time) }),
        ...(input.arrival_time && { arrival_time: new Date(input.arrival_time) }),
        ...(input.base_price && { base_price: input.base_price }),
        ...(input.aircraft_type && { aircraft_type: input.aircraft_type }),
        ...(input.duration_minutes && { duration_minutes: input.duration_minutes }),
        ...(input.gate && { gate: input.gate }),
        ...(input.terminal && { terminal: input.terminal }),
        ...(input.status && { status: input.status }),
      },
      include: {
        origin_airport: { include: { city: true } },
        destination_airport: { include: { city: true } },
      },
    });

    return flight;
  }

  public static async deleteFlight(id: string) {
    await prisma.flight.delete({
      where: { id },
    });
    return true;
  }
}
