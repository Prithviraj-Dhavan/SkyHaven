import { prisma } from '../../config/database.js';
import { FlightsService } from '../flights/flights.service.js';
import { FlightCreateInput, FlightUpdateInput } from '../flights/flights.schema.js';

export class AdminService {
  public static async getDashboardStats() {
    const [
      totalBookings,
      confirmedBookings,
      totalFlights,
      totalSeats,
      bookedSeats,
      revenueResult,
      recentBookings,
      flightsByStatus,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.flight.count({ where: { status: 'SCHEDULED' } }),
      prisma.seat.count(),
      prisma.seat.count({ where: { is_booked: true } }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { total_amount: true },
      }),
      prisma.booking.findMany({
        take: 8,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          flight: {
            include: {
              origin_airport: true,
              destination_airport: true,
            },
          },
          tickets: { select: { id: true, passenger_name: true } },
        },
      }),
      prisma.flight.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.total_amount || 0);
    const loadFactorPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    // Top routes performance
    const topFlights = await prisma.flight.findMany({
      take: 6,
      include: {
        origin_airport: true,
        destination_airport: true,
        _count: {
          select: {
            bookings: { where: { status: 'CONFIRMED' } },
            seats: { where: { is_booked: true } },
          },
        },
      },
      orderBy: {
        bookings: { _count: 'desc' },
      },
    });

    const routePerformance = topFlights.map((f) => ({
      flightNumber: f.flight_number,
      route: `${f.origin_airport.code} ➔ ${f.destination_airport.code}`,
      airline: f.airline,
      totalBookings: f._count.bookings,
      occupiedSeats: f._count.seats,
      basePrice: Number(f.base_price),
      status: f.status,
    }));

    return {
      overview: {
        totalRevenue,
        totalBookings,
        confirmedBookings,
        activeFlights: totalFlights,
        loadFactorPercent,
        totalSeats,
        bookedSeats,
      },
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        bookingReference: b.booking_reference,
        customerName: b.user.name,
        customerEmail: b.user.email,
        flightNumber: b.flight.flight_number,
        route: `${b.flight.origin_airport.code} ➔ ${b.flight.destination_airport.code}`,
        passengersCount: b.tickets.length,
        totalAmount: Number(b.total_amount),
        status: b.status,
        createdAt: b.created_at,
      })),
      routePerformance,
      flightsByStatus,
    };
  }

  public static async getAllFlights(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        include: {
          origin_airport: { include: { city: true } },
          destination_airport: { include: { city: true } },
          _count: {
            select: {
              seats: true,
              bookings: true,
            },
          },
        },
        orderBy: { departure_time: 'desc' },
        skip,
        take: limit,
      }),
      prisma.flight.count(),
    ]);

    return {
      flights: flights.map((f) => ({
        id: f.id,
        flightNumber: f.flight_number,
        airline: f.airline,
        aircraftType: f.aircraft_type,
        origin: `${f.origin_airport.city.name} (${f.origin_airport.code})`,
        destination: `${f.destination_airport.city.name} (${f.destination_airport.code})`,
        departureTime: f.departure_time,
        arrivalTime: f.arrival_time,
        basePrice: Number(f.base_price),
        status: f.status,
        gate: f.gate,
        terminal: f.terminal,
        totalSeats: f._count.seats,
        totalBookings: f._count.bookings,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getAllBookings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          flight: {
            include: {
              origin_airport: true,
              destination_airport: true,
            },
          },
          tickets: {
            include: { seat: true },
          },
          payments: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count(),
    ]);

    return {
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingReference: b.booking_reference,
        customerName: b.user.name,
        customerEmail: b.user.email,
        flightNumber: b.flight.flight_number,
        route: `${b.flight.origin_airport.code} ➔ ${b.flight.destination_airport.code}`,
        departureTime: b.flight.departure_time,
        passengers: b.tickets.map((t) => `${t.passenger_name} (${t.seat.seat_number})`),
        totalAmount: Number(b.total_amount),
        status: b.status,
        paymentStatus: b.payments[0]?.status || 'PENDING',
        paymentMethod: b.payments[0]?.payment_method || 'CARD',
        createdAt: b.created_at,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async createFlight(input: FlightCreateInput) {
    return FlightsService.createFlight(input);
  }

  public static async updateFlight(id: string, input: FlightUpdateInput) {
    return FlightsService.updateFlight(id, input);
  }

  public static async deleteFlight(id: string) {
    return FlightsService.deleteFlight(id);
  }
}
