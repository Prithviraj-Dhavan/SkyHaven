import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SkyHaven Database Seeding in Indian Rupees (INR)...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned previous records.');

  // 1. Seed Users
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordHashCustomer = await bcrypt.hash('Pass@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'SkyHaven Administrator',
      email: 'admin@skyhaven.com',
      password_hash: passwordHashAdmin,
      role: 'ADMIN',
      phone: '+91 98100 23456',
    },
  });

  const john = await prisma.user.create({
    data: {
      name: 'Prithviraj Sharma',
      email: 'john.doe@example.com',
      password_hash: passwordHashCustomer,
      role: 'CUSTOMER',
      phone: '+91 98201 88412',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Ananya Verma',
      email: 'sarah.smith@example.com',
      password_hash: passwordHashCustomer,
      role: 'CUSTOMER',
      phone: '+91 98711 44521',
    },
  });

  console.log('👤 Created demo users (Admin & Customers).');

  // 2. Seed Cities & Airports
  const citiesData = [
    { name: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80', code: 'DEL', airport: 'Indira Gandhi International Airport' },
    { name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj International Airport' },
    { name: 'Bengaluru', country: 'India', timezone: 'Asia/Kolkata', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80', code: 'BLR', airport: 'Kempegowda International Airport' },
    { name: 'Goa', country: 'India', timezone: 'Asia/Kolkata', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80', code: 'GOI', airport: 'Manohar International Airport' },
    { name: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', code: 'DXB', airport: 'Dubai International Airport' },
    { name: 'London', country: 'United Kingdom', timezone: 'Europe/London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', code: 'LHR', airport: 'London Heathrow Airport' },
    { name: 'New York', country: 'United States', timezone: 'America/New_York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', code: 'JFK', airport: 'John F. Kennedy International Airport' },
    { name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80', code: 'SIN', airport: 'Singapore Changi Airport' },
    { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', code: 'HND', airport: 'Tokyo Haneda Airport' },
    { name: 'Paris', country: 'France', timezone: 'Europe/Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', code: 'CDG', airport: 'Paris Charles de Gaulle Airport' },
    { name: 'San Francisco', country: 'United States', timezone: 'America/Los_Angeles', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80', code: 'SFO', airport: 'San Francisco International Airport' },
    { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', code: 'SYD', airport: 'Sydney Kingsford Smith Airport' },
  ];

  const airportMap = new Map<string, any>();

  for (const c of citiesData) {
    const city = await prisma.city.create({
      data: {
        name: c.name,
        country: c.country,
        timezone: c.timezone,
        image_url: c.image,
      },
    });

    const airport = await prisma.airport.create({
      data: {
        code: c.code,
        name: c.airport,
        city_id: city.id,
      },
      include: { city: true },
    });

    airportMap.set(c.code, airport);
  }

  console.log(`✈️ Created ${citiesData.length} Cities and International Airports.`);

  // 3. Seed Realistic INR Flights
  const airlines = [
    'SkyHaven Airways',
    'SkyLuxe International',
    'Vayu Jet',
    'Apex Global',
    'Oceanic Air',
    'StarWings',
  ];

  const aircraftTypes = [
    'Boeing 787-9 Dreamliner',
    'Airbus A350-900',
    'Airbus A321neo',
    'Boeing 777-300ER',
  ];

  const routes = [
    { from: 'DEL', to: 'BOM', basePrice: 4850, duration: 130 },
    { from: 'BOM', to: 'DEL', basePrice: 4850, duration: 130 },
    { from: 'DEL', to: 'GOI', basePrice: 5400, duration: 155 },
    { from: 'GOI', to: 'DEL', basePrice: 5400, duration: 155 },
    { from: 'BOM', to: 'GOI', basePrice: 3650, duration: 75 },
    { from: 'GOI', to: 'BOM', basePrice: 3650, duration: 75 },
    { from: 'DEL', to: 'BLR', basePrice: 6200, duration: 170 },
    { from: 'BLR', to: 'DEL', basePrice: 6200, duration: 170 },
    { from: 'BOM', to: 'BLR', basePrice: 4150, duration: 100 },
    { from: 'BLR', to: 'BOM', basePrice: 4150, duration: 100 },
    { from: 'BLR', to: 'GOI', basePrice: 3200, duration: 70 },
    { from: 'GOI', to: 'BLR', basePrice: 3200, duration: 70 },
    { from: 'DEL', to: 'DXB', basePrice: 18500, duration: 235 },
    { from: 'DXB', to: 'DEL', basePrice: 18500, duration: 235 },
    { from: 'BOM', to: 'LHR', basePrice: 48000, duration: 570 },
    { from: 'LHR', to: 'BOM', basePrice: 48000, duration: 570 },
    { from: 'DEL', to: 'JFK', basePrice: 68000, duration: 920 },
    { from: 'JFK', to: 'DEL', basePrice: 68000, duration: 920 },
    { from: 'SIN', to: 'HND', basePrice: 36000, duration: 410 },
    { from: 'HND', to: 'SIN', basePrice: 36000, duration: 410 },
    { from: 'LHR', to: 'JFK', basePrice: 42000, duration: 460 },
    { from: 'JFK', to: 'LHR', basePrice: 42000, duration: 460 },
    { from: 'CDG', to: 'DXB', basePrice: 34000, duration: 395 },
    { from: 'DXB', to: 'CDG', basePrice: 34000, duration: 395 },
    { from: 'SFO', to: 'HND', basePrice: 58000, duration: 680 },
    { from: 'SIN', to: 'SYD', basePrice: 39000, duration: 470 },
  ];

  const now = new Date();
  let flightCounter = 100;
  const createdFlights: any[] = [];
  const allSeats: any[] = [];

  // Seed flights for today and the next 10 days
  for (let dayOffset = 0; dayOffset <= 10; dayOffset++) {
    for (const r of routes) {
      flightCounter++;
      const depDate = new Date(now);
      depDate.setDate(now.getDate() + dayOffset);
      depDate.setHours(6 + (flightCounter % 14), ((flightCounter * 15) % 60), 0, 0);

      const arrDate = new Date(depDate.getTime() + r.duration * 60 * 1000);

      const airline = airlines[flightCounter % airlines.length];
      const aircraft = aircraftTypes[flightCounter % aircraftTypes.length];
      const originAirport = airportMap.get(r.from);
      const destAirport = airportMap.get(r.to);

      if (!originAirport || !destAirport) continue;

      const flightNum = `SH-${flightCounter}`;
      const priceVariation = Math.floor(Math.sin(flightCounter) * 300);
      const flight = await prisma.flight.create({
        data: {
          flight_number: flightNum,
          airline,
          origin_airport_id: originAirport.id,
          destination_airport_id: destAirport.id,
          departure_time: depDate,
          arrival_time: arrDate,
          base_price: Math.max(2500, r.basePrice + priceVariation),
          aircraft_type: aircraft,
          duration_minutes: r.duration,
          gate: `G${(flightCounter % 28) + 1}`,
          terminal: `T${(flightCounter % 3) + 1}`,
          status: 'SCHEDULED',
        },
      });

      createdFlights.push(flight);

      // Generate 12 Rows (72 seats per flight: 2 First, 3 Business, 2 Premium, 5 Economy)
      for (let row = 1; row <= 12; row++) {
        let cabinClass = 'ECONOMY';
        let priceModifier = 0;

        if (row <= 2) {
          cabinClass = 'FIRST';
          priceModifier = 12500;
        } else if (row <= 5) {
          cabinClass = 'BUSINESS';
          priceModifier = 7500;
        } else if (row <= 7) {
          cabinClass = 'PREMIUM_ECONOMY';
          priceModifier = 2800;
        }

        for (const col of ['A', 'B', 'C', 'D', 'E', 'F']) {
          allSeats.push({
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
    }
  }

  console.log(`✈️ Created ${createdFlights.length} Flights. Inserting ${allSeats.length} seats...`);

  const chunkSize = 500;
  for (let i = 0; i < allSeats.length; i += chunkSize) {
    const chunk = allSeats.slice(i, i + chunkSize);
    await prisma.seat.createMany({ data: chunk });
  }

  console.log(`🛫 Generated ${createdFlights.length} Flights with complete cabin grids.`);

  // 4. Seed sample past and upcoming bookings
  if (createdFlights.length > 2) {
    const upcomingFlight = createdFlights[1];
    const availableSeat1 = await prisma.seat.findFirst({
      where: { flight_id: upcomingFlight.id, is_booked: false, cabin_class: 'BUSINESS' },
    });

    if (availableSeat1) {
      await prisma.seat.update({
        where: { id: availableSeat1.id },
        data: { is_booked: true },
      });

      const booking = await prisma.booking.create({
        data: {
          booking_reference: 'SH-908234',
          user_id: john.id,
          flight_id: upcomingFlight.id,
          status: 'CONFIRMED',
          total_amount: Number(upcomingFlight.base_price) + Number(availableSeat1.price_modifier),
        },
      });

      await prisma.ticket.create({
        data: {
          ticket_number: 'TKT-9832104',
          booking_id: booking.id,
          seat_id: availableSeat1.id,
          passenger_name: 'Prithviraj Sharma',
          passenger_email: 'john.doe@example.com',
          passenger_document: 'P98421092',
          passenger_type: 'ADULT',
          pdf_url: '/api/v1/bookings/tickets/TKT-9832104/pdf',
        },
      });

      await prisma.payment.create({
        data: {
          booking_id: booking.id,
          provider: 'MOCK_STRIPE',
          status: 'SUCCESS',
          amount: booking.total_amount,
          currency: 'INR',
          transaction_ref: 'txn_stripe_908234sky',
          payment_method: 'UPI',
          card_last4: '9841',
        },
      });

      console.log('🎟️ Created sample active booking for Prithviraj Sharma.');
    }
  }

  console.log('✅ SkyHaven Database Seed in INR completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
