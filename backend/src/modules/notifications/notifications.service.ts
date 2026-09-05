import { eventBus, EVENTS } from './eventBus.js';
import { sendEmail } from '../../config/mailer.js';
import { generateBookingConfirmationEmail } from './emailTemplates.js';
import { prisma } from '../../config/database.js';

export class NotificationsService {
  public static init() {
    // Listen for confirmed booking event
    eventBus.on(EVENTS.BOOKING_CONFIRMED, async (payload: { bookingId: string }) => {
      try {
        await NotificationsService.sendBookingConfirmation(payload.bookingId);
      } catch (error) {
        console.error('❌ Failed to process booking confirmation notification:', error);
      }
    });

    console.log('📢 Notifications Module initialized with in-process event bus.');
  }

  public static async sendBookingConfirmation(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        flight: {
          include: {
            origin_airport: { include: { city: true } },
            destination_airport: { include: { city: true } },
          },
        },
        tickets: {
          include: {
            seat: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) return;

    const primaryTicket = booking.tickets[0];
    const recipientEmail = primaryTicket?.passenger_email || booking.user.email;
    const recipientName = primaryTicket?.passenger_name || booking.user.name;

    const seats = booking.tickets.map((t) => t.seat.seat_number);
    const payment = booking.payments[0];

    const html = generateBookingConfirmationEmail({
      passengerName: recipientName,
      bookingReference: booking.booking_reference,
      flightNumber: booking.flight.flight_number,
      airline: booking.flight.airline,
      originAirport: booking.flight.origin_airport.code,
      originCity: booking.flight.origin_airport.city.name,
      destAirport: booking.flight.destination_airport.code,
      destCity: booking.flight.destination_airport.city.name,
      departureTime: new Date(booking.flight.departure_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      arrivalTime: new Date(booking.flight.arrival_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      seats,
      totalAmount: Number(booking.total_amount).toFixed(2),
      currency: payment?.currency || 'USD',
    });

    await sendEmail({
      to: recipientEmail,
      subject: `✈️ SkyHaven Boarding Pass: Flight ${booking.flight.flight_number} (${booking.booking_reference})`,
      html,
    });
  }
}
