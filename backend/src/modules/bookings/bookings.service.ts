import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/error.middleware.js';
import { PaymentService } from './payment.service.js';
import { CreateBookingInput } from './bookings.schema.js';
import { eventBus, EVENTS } from '../notifications/eventBus.js';
import crypto from 'crypto';

export class BookingsService {
  public static async createBooking(userId: string, input: CreateBookingInput) {
    const { flightId, passengers, payment } = input;

    // Check flight existence
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        origin_airport: { include: { city: true } },
        destination_airport: { include: { city: true } },
      },
    });

    if (!flight) {
      throw new AppError('Selected flight was not found', 404, 'FLIGHT_NOT_FOUND');
    }

    const seatIds = passengers.map((p) => p.seatId);

    // Verify all requested seats are available and belong to this flight
    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
        flight_id: flightId,
      },
    });

    if (seats.length !== seatIds.length) {
      throw new AppError('One or more selected seats are invalid for this flight', 400, 'INVALID_SEATS');
    }

    const alreadyBooked = seats.filter((s) => s.is_booked);
    if (alreadyBooked.length > 0) {
      const bookedNumbers = alreadyBooked.map((s) => s.seat_number).join(', ');
      throw new AppError(`Seat(s) ${bookedNumbers} have already been reserved. Please pick different seats.`, 409, 'SEAT_ALREADY_BOOKED');
    }

    // Calculate total price in INR
    let totalAmount = 0;
    const seatMap = new Map(seats.map((s) => [s.id, s]));

    for (const p of passengers) {
      const seat = seatMap.get(p.seatId)!;
      const passengerPrice = Number(flight.base_price) + Number(seat.price_modifier);
      totalAmount += passengerPrice;
    }

    // Process payment through payment gateway service
    const paymentResult = await PaymentService.processPayment({
      amount: totalAmount,
      currency: 'INR',
      provider: payment.provider,
      paymentMethod: payment.paymentMethod,
      cardLast4: payment.cardLast4,
    });

    // Generate unique PNR
    const bookingReference = `AM-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Execute atomic transaction for seat locking, booking and ticket generation
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Lock all seats
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { is_booked: true },
      });

      // 2. Create booking record
      const createdBooking = await tx.booking.create({
        data: {
          booking_reference: bookingReference,
          user_id: userId,
          flight_id: flightId,
          status: 'CONFIRMED',
          total_amount: totalAmount,
        },
      });

      // 3. Create individual tickets
      const ticketsData = passengers.map((p) => {
        const ticketNum = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        return {
          ticket_number: ticketNum,
          booking_id: createdBooking.id,
          seat_id: p.seatId,
          passenger_name: p.name,
          passenger_email: p.email,
          passenger_document: p.documentNumber,
          passenger_type: p.type || 'ADULT',
          pdf_url: `/api/v1/bookings/tickets/${ticketNum}/pdf`,
        };
      });

      for (const t of ticketsData) {
        await tx.ticket.create({ data: t });
      }

      // 4. Create payment record
      await tx.payment.create({
        data: {
          booking_id: createdBooking.id,
          provider: payment.provider || 'MOCK_RAZORPAY_GATEWAY',
          status: 'SUCCESS',
          amount: totalAmount,
          currency: 'INR',
          transaction_ref: paymentResult.transactionRef,
          payment_method: payment.paymentMethod,
          card_last4: payment.cardLast4 || '9841',
        },
      });

      return createdBooking;
    });

    // Fetch full booking structure
    const fullBooking = await this.getBookingById(booking.id);

    // Emit in-process notification event
    eventBus.emit(EVENTS.BOOKING_CONFIRMED, {
      booking: fullBooking,
      userEmail: passengers[0]?.email || 'traveler@skyhaven.com',
    });

    return fullBooking;
  }

  public static async getBookingById(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        flight: {
          include: {
            origin_airport: { include: { city: true } },
            destination_airport: { include: { city: true } },
          },
        },
        tickets: {
          include: { seat: true },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking was not found', 404, 'BOOKING_NOT_FOUND');
    }

    return this.formatBooking(booking);
  }

  public static async getBookingByReference(bookingReference: string) {
    const booking = await prisma.booking.findUnique({
      where: { booking_reference: bookingReference },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        flight: {
          include: {
            origin_airport: { include: { city: true } },
            destination_airport: { include: { city: true } },
          },
        },
        tickets: {
          include: { seat: true },
        },
        payments: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking was not found', 404, 'BOOKING_NOT_FOUND');
    }

    return this.formatBooking(booking);
  }

  public static async getUserBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        flight: {
          include: {
            origin_airport: { include: { city: true } },
            destination_airport: { include: { city: true } },
          },
        },
        tickets: {
          include: { seat: true },
        },
        payments: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return bookings.map((b) => this.formatBooking(b));
  }

  public static async cancelBooking(userId: string, bookingId: string, isAdmin = false) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true, payments: true },
    });

    if (!booking) {
      throw new AppError('Booking was not found', 404, 'BOOKING_NOT_FOUND');
    }

    if (!isAdmin && booking.user_id !== userId) {
      throw new AppError('You are not authorized to cancel this booking', 403, 'FORBIDDEN');
    }

    if (booking.status === 'CANCELLED') {
      throw new AppError('This booking has already been cancelled', 400, 'ALREADY_CANCELLED');
    }

    const seatIds = booking.tickets.map((t) => t.seat_id);

    await prisma.$transaction(async (tx) => {
      // 1. Release seats
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { is_booked: false },
      });

      // 2. Update booking status
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // 3. Mark payment refunded
      if (booking.payments.length > 0) {
        await tx.payment.updateMany({
          where: { booking_id: bookingId },
          data: { status: 'REFUNDED' },
        });
      }
    });

    return { message: 'Booking cancelled and seats released successfully' };
  }

  private static formatBooking(booking: any) {
    return {
      id: booking.id,
      bookingReference: booking.booking_reference,
      status: booking.status,
      totalAmount: Number(booking.total_amount),
      createdAt: booking.created_at,
      user: booking.user,
      flight: {
        id: booking.flight.id,
        flightNumber: booking.flight.flight_number,
        airline: booking.flight.airline,
        aircraftType: booking.flight.aircraft_type,
        departureTime: booking.flight.departure_time,
        arrivalTime: booking.flight.arrival_time,
        durationMinutes: booking.flight.duration_minutes,
        gate: booking.flight.gate,
        terminal: booking.flight.terminal,
        status: booking.flight.status,
        origin: {
          code: booking.flight.origin_airport.code,
          name: booking.flight.origin_airport.name,
          city: booking.flight.origin_airport.city.name,
          country: booking.flight.origin_airport.city.country,
        },
        destination: {
          code: booking.flight.destination_airport.code,
          name: booking.flight.destination_airport.name,
          city: booking.flight.destination_airport.city.name,
          country: booking.flight.destination_airport.city.country,
        },
      },
      tickets: booking.tickets.map((t: any) => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        passengerName: t.passenger_name,
        passengerEmail: t.passenger_email,
        passengerDocument: t.passenger_document,
        passengerType: t.passenger_type,
        seatId: t.seat_id,
        seatNumber: t.seat.seat_number,
        cabinClass: t.seat.cabin_class,
        pdfUrl: t.pdf_url,
      })),
      payment: booking.payments[0]
        ? {
            id: booking.payments[0].id,
            status: booking.payments[0].status,
            amount: Number(booking.payments[0].amount),
            currency: booking.payments[0].currency,
            transactionRef: booking.payments[0].transaction_ref,
            paymentMethod: booking.payments[0].payment_method,
            cardLast4: booking.payments[0].card_last4,
          }
        : null,
    };
  }
}
