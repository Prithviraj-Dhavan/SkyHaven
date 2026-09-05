import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/error.middleware.js';

export class BookingsController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const booking = await BookingsService.createBooking(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Flight booking confirmed successfully!',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUserBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const bookings = await BookingsService.getUserBookings(userId);
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getByReference(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.getBookingByReference(req.params.reference);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const isAdmin = req.user?.role === 'ADMIN';
      const result = await BookingsService.cancelBooking(userId, req.params.id, isAdmin);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTicketView(req: Request, res: Response, next: NextFunction) {
    try {
      const { ticketNumber } = req.params;
      const ticket = await prisma.ticket.findUnique({
        where: { ticket_number: ticketNumber },
        include: {
          seat: true,
          booking: {
            include: {
              flight: {
                include: {
                  origin_airport: { include: { city: true } },
                  destination_airport: { include: { city: true } },
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        data: {
          ticketNumber: ticket.ticket_number,
          passengerName: ticket.passenger_name,
          passengerEmail: ticket.passenger_email,
          passengerDocument: ticket.passenger_document,
          passengerType: ticket.passenger_type,
          bookingReference: ticket.booking.booking_reference,
          seatNumber: ticket.seat.seat_number,
          cabinClass: ticket.seat.cabin_class,
          flightNumber: ticket.booking.flight.flight_number,
          airline: ticket.booking.flight.airline,
          aircraftType: ticket.booking.flight.aircraft_type,
          gate: ticket.booking.flight.gate || 'G12',
          terminal: ticket.booking.flight.terminal || 'T3',
          departureTime: ticket.booking.flight.departure_time,
          arrivalTime: ticket.booking.flight.arrival_time,
          origin: {
            code: ticket.booking.flight.origin_airport.code,
            name: ticket.booking.flight.origin_airport.name,
            city: ticket.booking.flight.origin_airport.city.name,
          },
          destination: {
            code: ticket.booking.flight.destination_airport.code,
            name: ticket.booking.flight.destination_airport.name,
            city: ticket.booking.flight.destination_airport.city.name,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
