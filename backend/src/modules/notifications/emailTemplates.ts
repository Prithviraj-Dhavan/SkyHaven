export function generateBookingConfirmationEmail({
  passengerName,
  bookingReference,
  flightNumber,
  airline,
  originAirport,
  originCity,
  destAirport,
  destCity,
  departureTime,
  arrivalTime,
  seats,
  totalAmount,
  currency,
}: {
  passengerName: string;
  bookingReference: string;
  flightNumber: string;
  airline: string;
  originAirport: string;
  originCity: string;
  destAirport: string;
  destCity: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  totalAmount: number | string;
  currency: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SkyHaven Flight Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; margin: 0; padding: 24px; color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6, #6366f1); padding: 32px 24px; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 8px; }
    .title { font-size: 18px; color: rgba(255,255,255,0.9); margin: 0; font-weight: 500; }
    .body { padding: 32px 24px; }
    .ref-box { background: #1f2937; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; border: 1px dashed #374151; }
    .ref-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }
    .ref-val { font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: 2px; margin-top: 4px; }
    .route-card { background: #182234; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #23354d; }
    .route-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .airline-name { font-size: 14px; font-weight: 600; color: #93c5fd; }
    .flight-pill { background: #1e3a8a; color: #60a5fa; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
    .timeline { display: table; width: 100%; }
    .time-col { display: table-cell; vertical-align: top; width: 40%; }
    .mid-col { display: table-cell; vertical-align: middle; width: 20%; text-align: center; color: #38bdf8; font-size: 18px; }
    .time-val { font-size: 18px; font-weight: 700; color: #ffffff; }
    .airport-code { font-size: 14px; font-weight: 600; color: #38bdf8; }
    .city-name { font-size: 12px; color: #9ca3af; }
    .details-grid { display: table; width: 100%; margin-top: 20px; border-top: 1px solid #283548; padding-top: 16px; }
    .grid-cell { display: table-cell; width: 33.33%; }
    .cell-label { font-size: 11px; color: #9ca3af; text-transform: uppercase; }
    .cell-val { font-size: 14px; font-weight: 700; color: #f3f4f6; margin-top: 2px; }
    .footer { background: #0c121e; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">✈️ SkyHaven</div>
      <div class="title">Booking Confirmation & Boarding Pass</div>
    </div>
    <div class="body">
      <p style="margin-top:0; color:#e5e7eb; font-size:15px;">Hello <strong>${passengerName}</strong>,</p>
      <p style="color:#9ca3af; font-size:14px; line-height:1.5;">Your flight is confirmed and ready. Below are your travel details and reservation summary.</p>
      
      <div class="ref-box">
        <div class="ref-label">Booking Reference (PNR)</div>
        <div class="ref-val">${bookingReference}</div>
      </div>

      <div class="route-card">
        <div class="route-header">
          <span class="airline-name">${airline}</span>
          <span class="flight-pill">${flightNumber}</span>
        </div>
        <div class="timeline">
          <div class="time-col">
            <div class="time-val">${departureTime}</div>
            <div class="airport-code">${originAirport}</div>
            <div class="city-name">${originCity}</div>
          </div>
          <div class="mid-col">✈ ➔</div>
          <div class="time-col" style="text-align:right;">
            <div class="time-val">${arrivalTime}</div>
            <div class="airport-code">${destAirport}</div>
            <div class="city-name">${destCity}</div>
          </div>
        </div>

        <div class="details-grid">
          <div class="grid-cell">
            <div class="cell-label">Seat(s)</div>
            <div class="cell-val">${seats.join(', ')}</div>
          </div>
          <div class="grid-cell">
            <div class="cell-label">Status</div>
            <div class="cell-val" style="color:#34d399;">CONFIRMED</div>
          </div>
          <div class="grid-cell" style="text-align:right;">
            <div class="cell-label">Total Paid</div>
            <div class="cell-val">${currency} ${totalAmount}</div>
          </div>
        </div>
      </div>

      <p style="font-size:13px; color:#9ca3af; line-height:1.5;">
        Please arrive at the airport at least 2 hours prior to scheduled departure for domestic flights and 3 hours for international flights. Have your government ID ready at check-in.
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} SkyHaven Aviation Technologies. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
}
