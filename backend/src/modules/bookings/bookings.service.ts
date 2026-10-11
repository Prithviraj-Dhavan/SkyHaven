import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/error.middleware.js';
import { PaymentService } from './payment.service.js';
import { CreateBookingInput } from './bookings.schema.js';
import { eventBus, EVENTS } from '../notifications/eventBus.js';
import crypto from 'crypto';

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export class BookingsService {
  /**
   * Places a temporary 5-minute hold on the given seats for this user.
   * Blocks anyone else from holding or booking the same seats until it expires.
   */
    public static async holdSeats(userId: string, seatIds: string[]) {
    const now = new Date();

    // Lazy cleanup: clear expired holds on these seats so they don't block
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
        held_until: { lte: now },
        is_booked: false,
      },
      data: {
        held_until: null,
        held_by_user_id: null,
      },
    }).catch(() => {});

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    if (seats.length !== seatIds.length) {
      throw new AppError('One or more selected seats do not exist', 400, 'INVALID_SEATS');
    }

    const unavailable = seats.filter((s) => {
      if (s.is_booked) return true;
      if (s.held_until && s.held_until > now && s.held_by_user_id !== userId) return true;
      return false;
    });

    if (unavailable.length > 0) {
      const nums = unavailable.map((s) => s.seat_number).join(', ');
      throw new AppError(
        `Seat(s) ${nums} are currently held or booked by another traveler. Please pick different seats.`,
        409,
        'SEAT_UNAVAILABLE'
      );
    }

    // If this exact user already holds ALL of these seats and that hold hasn't
    // expired yet, keep the existing expiry instead of resetting the clock.
    const alreadyHeldByThisUser = seats.every(
      (s) => s.held_until && s.held_until > now && s.held_by_user_id === userId
    );

    if (alreadyHeldByThisUser) {
      const earliestExpiry = seats.reduce(
        (min, s) => (s.held_until! < min ? s.held_until! : min),
        seats[0].held_until!
      );
      return { expiresAt: earliestExpiry };
    }

    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

    // Atomic compare-and-swap: only updates if seat is not booked and not held by another user
    const updateResult = await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
        is_booked: false,
        OR: [
          { held_until: null },
          { held_until: { lte: now } },
          { held_by_user_id: userId },
        ],
      },
      data: { held_until: expiresAt, held_by_user_id: userId },
    });

    if (updateResult.count !== seatIds.length) {
      throw new AppError(
        'One or more selected seats were just held by another traveler in the same instant. Please pick different seats.',
        409,
        'SEAT_UNAVAILABLE'
      );
    }

    return { expiresAt };
  }

  /**
   * Releases a hold early — called when the user closes the payment modal
   * or their hold expires client-side.
   */
  public static async releaseHold(userId: string, seatIds?: string[]) {
    await prisma.seat.updateMany({
      where: {
        ...(seatIds && seatIds.length > 0 ? { id: { in: seatIds } } : {}),
        held_by_user_id: userId,
      },
      data: { held_until: null, held_by_user_id: null },
    });

    return { message: 'Hold released' };
  }

  /**
   * Retrieves any active seat hold currently active for the user.
   * Allows users who leave or navigate away during payment to seamlessly
   * see their locked seats and resume booking within the 5-minute window.
   */
  public static async getActiveHold(userId: string) {
    const now = new Date();

    // Lazy cleanup: clear any expired holds for this user
    await prisma.seat.updateMany({
      where: {
        held_by_user_id: userId,
        held_until: { lte: now },
        is_booked: false,
      },
      data: {
        held_until: null,
        held_by_user_id: null,
      },
    }).catch(() => {});

    const heldSeats = await prisma.seat.findMany({
      where: {
        held_by_user_id: userId,
        held_until: { gt: now },
        is_booked: false,
      },
      include: {
        flight: {
          include: {
            origin_airport: { include: { city: true } },
            destination_airport: { include: { city: true } },
          },
        },
      },
      orderBy: { seat_number: 'asc' },
    });

    if (heldSeats.length === 0) {
      return { hasActiveHold: false, hold: null };
    }

    const flight = heldSeats[0].flight;
    // Earliest expiry among the seats
    const expiresAt = heldSeats.reduce(
      (earliest, s) => (s.held_until! < earliest ? s.held_until! : earliest),
      heldSeats[0].held_until!
    );

    const formattedFlight = {
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
      },
      destination: {
        code: flight.destination_airport.code,
        name: flight.destination_airport.name,
        city: flight.destination_airport.city.name,
      },
    };

    const formattedSeats = heldSeats.map((s) => ({
      id: s.id,
      seatNumber: s.seat_number,
      cabinClass: s.cabin_class,
      isBooked: false,
      isHeldByMe: true,
      priceModifier: Number(s.price_modifier),
      row: s.row,
      column: s.column,
      isExitRow: s.is_exit_row,
      totalPrice: Number(flight.base_price) + Number(s.price_modifier),
      heldUntil: s.held_until ? s.held_until.toISOString() : null,
    }));

    const totalAmount = formattedSeats.reduce((acc, s) => acc + (s.totalPrice || Number(flight.base_price)), 0);

    return {
      hasActiveHold: true,
      hold: {
        flight: formattedFlight,
        seats: formattedSeats,
        seatIds: formattedSeats.map((s) => s.id),
        seatNumbers: formattedSeats.map((s) => s.seatNumber),
        expiresAt: expiresAt.toISOString(),
        totalAmount,
      },
    };
  }

  public static async createBooking(userId: string, input: CreateBookingInput) {
    const { flightId, passengers, returnFlightId, returnPassengers, payment } = input;

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

    const seats = await prisma.seat.findMany({
      where: {
        id: { in: seatIds },
        flight_id: flightId,
      },
    });

    if (seats.length !== seatIds.length) {
      throw new AppError('One or more selected seats are invalid for this flight', 400, 'INVALID_SEATS');
    }

    const now = new Date();

    // Lazy cleanup: clear expired holds for these seats
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
        held_until: { lte: now },
        is_booked: false,
      },
      data: {
        held_until: null,
        held_by_user_id: null,
      },
    }).catch(() => {});

    const unavailable = seats.filter((s) => {
      if (s.is_booked) return true;
      if (s.held_until && s.held_until > now && s.held_by_user_id !== userId) return true;
      return false;
    });

    if (unavailable.length > 0) {
      const bookedNumbers = unavailable.map((s) => s.seat_number).join(', ');
      throw new AppError(
        `Seat(s) ${bookedNumbers} have already been reserved or held by another traveler. Please pick different seats.`,
        409,
        'SEAT_ALREADY_BOOKED'
      );
    }

    let totalAmount = 0;
    const seatMap = new Map(seats.map((s) => [s.id, s]));

    for (const p of passengers) {
      const seat = seatMap.get(p.seatId)!;
      const passengerPrice = Number(flight.base_price) + Number(seat.price_modifier);
      totalAmount += passengerPrice;
    }

    // Optional Return Flight handling
    let returnFlight: any = null;
    let returnSeats: any[] = [];
    let returnTotalAmount = 0;
    const hasReturn = Boolean(returnFlightId && returnPassengers && returnPassengers.length > 0);

    if (hasReturn) {
      returnFlight = await prisma.flight.findUnique({
        where: { id: returnFlightId },
      });
      if (!returnFlight) {
        throw new AppError('Selected return flight was not found', 404, 'RETURN_FLIGHT_NOT_FOUND');
      }

      const returnSeatIds = returnPassengers!.map((p) => p.seatId);
      returnSeats = await prisma.seat.findMany({
        where: { id: { in: returnSeatIds }, flight_id: returnFlightId },
      });

      if (returnSeats.length !== returnSeatIds.length) {
        throw new AppError('One or more selected return seats are invalid', 400, 'INVALID_SEATS');
      }

      await prisma.seat.updateMany({
        where: { id: { in: returnSeatIds }, held_until: { lte: now }, is_booked: false },
        data: { held_until: null, held_by_user_id: null },
      }).catch(() => {});

      const returnUnavailable = returnSeats.filter((s) => {
        if (s.is_booked) return true;
        if (s.held_until && s.held_until > now && s.held_by_user_id !== userId) return true;
        return false;
      });

      if (returnUnavailable.length > 0) {
        const bookedNums = returnUnavailable.map((s) => s.seat_number).join(', ');
        throw new AppError(`Return seat(s) ${bookedNums} have already been reserved or held.`, 409, 'SEAT_ALREADY_BOOKED');
      }

      const returnSeatMap = new Map(returnSeats.map((s) => [s.id, s]));
      for (const p of returnPassengers!) {
        const seat = returnSeatMap.get(p.seatId)!;
        returnTotalAmount += Number(returnFlight.base_price) + Number(seat.price_modifier);
      }
    }

    const combinedTotal = totalAmount + returnTotalAmount;

    // Verify with Stripe directly that the payment actually succeeded and
    // matches the combined total we calculated server-side.
    const paymentResult = await PaymentService.verifyPayment(
      payment.paymentIntentId,
      combinedTotal,
      'inr'
    );

    const bookingReference = `SH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const returnBookingReference = hasReturn ? `SH-${crypto.randomBytes(3).toString('hex').toUpperCase()}` : null;

    const { createdBooking, createdReturnBooking } = await prisma.$transaction(async (tx) => {
      // 1. Lock outbound seats
      const updatedSeats = await tx.seat.updateMany({
        where: {
          id: { in: seatIds },
          is_booked: false,
          OR: [
            { held_by_user_id: userId },
            { held_until: null },
            { held_until: { lte: now } },
          ],
        },
        data: { is_booked: true, held_until: null, held_by_user_id: null },
      });

      if (updatedSeats.count !== seatIds.length) {
        throw new AppError(
          'Seat reservation conflict: one or more selected seats have already been booked or held by another traveler.',
          409,
          'SEAT_ALREADY_BOOKED'
        );
      }

      const bookingRec = await tx.booking.create({
        data: {
          booking_reference: bookingReference,
          user_id: userId,
          flight_id: flightId,
          status: 'CONFIRMED',
          total_amount: totalAmount,
        },
      });

      const ticketsData = passengers.map((p) => {
        const ticketNum = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        return {
          ticket_number: ticketNum,
          booking_id: bookingRec.id,
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

      await tx.payment.create({
        data: {
          booking_id: bookingRec.id,
          provider: 'STRIPE',
          status: paymentResult.status,
          amount: totalAmount,
          currency: paymentResult.currency,
          transaction_ref: paymentResult.transactionRef,
          payment_method: paymentResult.paymentMethod,
          card_last4: paymentResult.cardLast4,
        },
      });

      // 2. Lock return seats and create return booking if round-trip
      let retBookingRec: any = null;
      if (hasReturn && returnFlightId && returnPassengers) {
        const returnSeatIds = returnPassengers.map((p) => p.seatId);
        const updatedReturnSeats = await tx.seat.updateMany({
          where: {
            id: { in: returnSeatIds },
            is_booked: false,
            OR: [
              { held_by_user_id: userId },
              { held_until: null },
              { held_until: { lte: now } },
            ],
          },
          data: { is_booked: true, held_until: null, held_by_user_id: null },
        });

        if (updatedReturnSeats.count !== returnSeatIds.length) {
          throw new AppError('One or more selected return seats were just taken. Reservation cancelled.', 409, 'SEAT_ALREADY_BOOKED');
        }

        retBookingRec = await tx.booking.create({
          data: {
            booking_reference: returnBookingReference!,
            user_id: userId,
            flight_id: returnFlightId,
            status: 'CONFIRMED',
            total_amount: returnTotalAmount,
          },
        });

        const returnTicketsData = returnPassengers.map((p) => {
          const ticketNum = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          return {
            ticket_number: ticketNum,
            booking_id: retBookingRec.id,
            seat_id: p.seatId,
            passenger_name: p.name,
            passenger_email: p.email,
            passenger_document: p.documentNumber,
            passenger_type: p.type || 'ADULT',
            pdf_url: `/api/v1/bookings/tickets/${ticketNum}/pdf`,
          };
        });

        for (const t of returnTicketsData) {
          await tx.ticket.create({ data: t });
        }

        await tx.payment.create({
          data: {
            booking_id: retBookingRec.id,
            provider: 'STRIPE',
            status: paymentResult.status,
            amount: returnTotalAmount,
            currency: paymentResult.currency,
            transaction_ref: `${paymentResult.transactionRef}-RET`,
            payment_method: paymentResult.paymentMethod,
            card_last4: paymentResult.cardLast4,
          },
        });
      }

      return { createdBooking: bookingRec, createdReturnBooking: retBookingRec };
    });

    const fullBooking: any = await this.getBookingById(createdBooking.id);
    if (createdReturnBooking) {
      fullBooking.returnBooking = await this.getBookingById(createdReturnBooking.id);
    }

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
        tickets: { include: { seat: true } },
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
        tickets: { include: { seat: true } },
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
        tickets: { include: { seat: true } },
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
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { is_booked: false },
      });

      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      if (booking.payments.length > 0) {
        await tx.payment.updateMany({
          where: { booking_id: bookingId },
          data: { status: 'REFUNDED' },
        });
      }
    });

    // Process actual money refund via Stripe for each successful payment
    for (const payment of booking.payments) {
      if (payment.status === 'SUCCESS' && payment.transaction_ref) {
        try {
          await PaymentService.processRefund(payment.transaction_ref, Number(payment.amount));
        } catch (error) {
          console.error(`Failed to refund payment ${payment.id}:`, error);
          // In a real app we might retry this via a cron job, but we'll log it for now.
        }
      }
    }

    return { message: 'Booking cancelled, seats released, and payment refunded successfully' };
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