import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Fast All-Station SkyHaven Seeding in INR...');

  // Clean previous records
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing records.');

  // 1. Users
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordHashCustomer = await bcrypt.hash('Pass@123', 10);

  const admin = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'SkyHaven Administrator',
      email: 'admin@skyhaven.com',
      password_hash: passwordHashAdmin,
      role: 'ADMIN',
      phone: '+91 98100 23456',
    },
  });

  const john = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Prithviraj Sharma',
      email: 'john.doe@example.com',
      password_hash: passwordHashCustomer,
      role: 'CUSTOMER',
      phone: '+91 98201 88412',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: randomUUID(),
      name: 'Ananya Verma',
      email: 'sarah.smith@example.com',
      password_hash: passwordHashCustomer,
      role: 'CUSTOMER',
      phone: '+91 98711 44521',
    },
  });

  console.log('👤 Created demo users.');

  // 2. Cities & Airports
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

  const airportMap = new Map<string, string>(); // code -> id

  for (const c of citiesData) {
    const cityId = randomUUID();
    await prisma.city.create({
      data: {
        id: cityId,
        name: c.name,
        country: c.country,
        timezone: c.timezone,
        image_url: c.image,
      },
    });

    const airportId = randomUUID();
    await prisma.airport.create({
      data: {
        id: airportId,
        code: c.code,
        name: c.airport,
        city_id: cityId,
      },
    });

    airportMap.set(c.code, airportId);
  }

  console.log(`✈️ Created ${citiesData.length} Cities and International Airports.`);

  // 3. Complete All-Station Route Matrix
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

  const airportCodes = citiesData.map(c => c.code);

  function getRouteMetrics(from: string, to: string) {
    const predefined: Record<string, { duration: number; basePrice: number }> = {
      'DEL-BOM': { duration: 130, basePrice: 4850 },
      'BOM-DEL': { duration: 130, basePrice: 4850 },
      'DEL-GOI': { duration: 155, basePrice: 5400 },
      'GOI-DEL': { duration: 155, basePrice: 5400 },
      'BOM-GOI': { duration: 75, basePrice: 3650 },
      'GOI-BOM': { duration: 75, basePrice: 3650 },
      'DEL-BLR': { duration: 170, basePrice: 6200 },
      'BLR-DEL': { duration: 170, basePrice: 6200 },
      'BOM-BLR': { duration: 100, basePrice: 4150 },
      'BLR-BOM': { duration: 100, basePrice: 4150 },
      'BLR-GOI': { duration: 70, basePrice: 3200 },
      'GOI-BLR': { duration: 70, basePrice: 3200 },

      // India <-> Middle East
      'DEL-DXB': { duration: 235, basePrice: 18500 },
      'DXB-DEL': { duration: 235, basePrice: 18500 },
      'BOM-DXB': { duration: 200, basePrice: 16800 },
      'DXB-BOM': { duration: 200, basePrice: 16800 },
      'BLR-DXB': { duration: 245, basePrice: 19200 },
      'DXB-BLR': { duration: 245, basePrice: 19200 },
      'GOI-DXB': { duration: 215, basePrice: 17900 },
      'DXB-GOI': { duration: 215, basePrice: 17900 },

      // India <-> Europe
      'DEL-LHR': { duration: 550, basePrice: 46000 },
      'LHR-DEL': { duration: 550, basePrice: 46000 },
      'BOM-LHR': { duration: 570, basePrice: 48000 },
      'LHR-BOM': { duration: 570, basePrice: 48000 },
      'BLR-LHR': { duration: 610, basePrice: 49500 },
      'LHR-BLR': { duration: 610, basePrice: 49500 },
      'DEL-CDG': { duration: 530, basePrice: 44000 },
      'CDG-DEL': { duration: 530, basePrice: 44000 },
      'BOM-CDG': { duration: 545, basePrice: 45500 },
      'CDG-BOM': { duration: 545, basePrice: 45500 },
      'BLR-CDG': { duration: 590, basePrice: 47000 },
      'CDG-BLR': { duration: 590, basePrice: 47000 },

      // India <-> North America
      'DEL-JFK': { duration: 920, basePrice: 68000 },
      'JFK-DEL': { duration: 920, basePrice: 68000 },
      'BOM-JFK': { duration: 950, basePrice: 71000 },
      'JFK-BOM': { duration: 950, basePrice: 71000 },
      'DEL-SFO': { duration: 960, basePrice: 72000 },
      'SFO-DEL': { duration: 960, basePrice: 72000 },
      'BLR-SFO': { duration: 980, basePrice: 74000 },
      'SFO-BLR': { duration: 980, basePrice: 74000 },

      // India <-> East Asia & Pacific
      'DEL-SIN': { duration: 330, basePrice: 24500 },
      'SIN-DEL': { duration: 330, basePrice: 24500 },
      'BOM-SIN': { duration: 315, basePrice: 23800 },
      'SIN-BOM': { duration: 315, basePrice: 23800 },
      'BLR-SIN': { duration: 285, basePrice: 21500 },
      'SIN-BLR': { duration: 285, basePrice: 21500 },
      'DEL-HND': { duration: 490, basePrice: 41000 },
      'HND-DEL': { duration: 490, basePrice: 41000 },
      'BOM-HND': { duration: 510, basePrice: 42500 },
      'HND-BOM': { duration: 510, basePrice: 42500 },
      'DEL-SYD': { duration: 690, basePrice: 52000 },
      'SYD-DEL': { duration: 690, basePrice: 52000 },
      'BOM-SYD': { duration: 710, basePrice: 54000 },
      'SYD-BOM': { duration: 710, basePrice: 54000 },

      // Major Global Connectors
      'LHR-JFK': { duration: 460, basePrice: 42000 },
      'JFK-LHR': { duration: 460, basePrice: 42000 },
      'LHR-CDG': { duration: 80, basePrice: 9500 },
      'CDG-LHR': { duration: 80, basePrice: 9500 },
      'SIN-HND': { duration: 410, basePrice: 36000 },
      'HND-SIN': { duration: 410, basePrice: 36000 },
      'SIN-SYD': { duration: 470, basePrice: 39000 },
      'SYD-SIN': { duration: 470, basePrice: 39000 },
      'SFO-HND': { duration: 680, basePrice: 58000 },
      'HND-SFO': { duration: 680, basePrice: 58000 },
      'CDG-DXB': { duration: 395, basePrice: 34000 },
      'DXB-CDG': { duration: 395, basePrice: 34000 },
    };

    const key = `${from}-${to}`;
    if (predefined[key]) return predefined[key];

    const isIndiaFrom = ['DEL', 'BOM', 'BLR', 'GOI'].includes(from);
    const isIndiaTo = ['DEL', 'BOM', 'BLR', 'GOI'].includes(to);
    if (isIndiaFrom && isIndiaTo) {
      return { duration: 120, basePrice: 4500 };
    } else if (isIndiaFrom || isIndiaTo) {
      return { duration: 450, basePrice: 38000 };
    }
    return { duration: 520, basePrice: 46000 };
  }

  // 132 pairwise routes
  const routes: { from: string; to: string; basePrice: number; duration: number }[] = [];
  for (const from of airportCodes) {
    for (const to of airportCodes) {
      if (from !== to) {
        const metrics = getRouteMetrics(from, to);
        routes.push({ from, to, basePrice: metrics.basePrice, duration: metrics.duration });
      }
    }
  }

  console.log(`🗺️ Generated ${routes.length} pairwise routes connecting all ${airportCodes.length} stations.`);

  const now = new Date();
  const baseYear = now.getUTCFullYear();
  const baseMonth = now.getUTCMonth();
  const baseDate = now.getUTCDate();
  let flightCounter = 100;
  const flightRecords: any[] = [];
  const allSeats: any[] = [];

  // Seed across today and next 9 days (10 days total)
  // 132 routes * 10 days = 1,320 flights with FULL 12 ROWS (72 seats per flight) = 95,040 seats!
  for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
    for (const r of routes) {
      flightCounter++;
      const hour = 6 + ((flightCounter * 3) % 15);
      const minute = (flightCounter * 15) % 60;
      const depDate = new Date(Date.UTC(baseYear, baseMonth, baseDate + dayOffset, hour, minute, 0, 0));
      const arrDate = new Date(depDate.getTime() + r.duration * 60 * 1000);
      const airline = airlines[flightCounter % airlines.length];
      const aircraft = aircraftTypes[flightCounter % aircraftTypes.length];
      const originId = airportMap.get(r.from)!;
      const destId = airportMap.get(r.to)!;

      const flightId = randomUUID();
      const flightNum = `SH-${flightCounter}`;
      const priceVariation = Math.floor(Math.sin(flightCounter) * 350);

      flightRecords.push({
        id: flightId,
        flight_number: flightNum,
        airline,
        origin_airport_id: originId,
        destination_airport_id: destId,
        departure_time: depDate,
        arrival_time: arrDate,
        base_price: Math.max(2500, r.basePrice + priceVariation),
        aircraft_type: aircraft,
        duration_minutes: r.duration,
        gate: `G${(flightCounter % 28) + 1}`,
        terminal: `T${(flightCounter % 3) + 1}`,
        status: 'SCHEDULED',
      });

      // FULL 12 Rows (72 seats per flight: 2 First, 3 Business, 2 Premium, 5 Economy)
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
            id: randomUUID(),
            flight_id: flightId,
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

  console.log(`✈️ Inserting ${flightRecords.length} Flights in high-speed batches...`);
  // Insert flights in batches of 500
  for (let i = 0; i < flightRecords.length; i += 500) {
    const chunk = flightRecords.slice(i, i + 500);
    await prisma.flight.createMany({ data: chunk });
  }
  console.log(`✅ ${flightRecords.length} Flights inserted successfully!`);

  console.log(`💺 Inserting ${allSeats.length} Seats in high-speed batches...`);
  // Insert seats in batches of 2000
  for (let i = 0; i < allSeats.length; i += 2000) {
    const chunk = allSeats.slice(i, i + 2000);
    await prisma.seat.createMany({ data: chunk });
  }
  console.log(`✅ ${allSeats.length} Seats inserted successfully!`);

  // Sample booking for demo user
  const sampleFlight = flightRecords[0];
  const sampleSeat = allSeats.find(s => s.flight_id === sampleFlight.id && s.cabin_class === 'BUSINESS') || allSeats[0];
  
  await prisma.seat.update({
    where: { id: sampleSeat.id },
    data: { is_booked: true }
  });

  const booking = await prisma.booking.create({
    data: {
      id: randomUUID(),
      booking_reference: 'SH-908234',
      user_id: john.id,
      flight_id: sampleFlight.id,
      status: 'CONFIRMED',
      total_amount: Number(sampleFlight.base_price) + Number(sampleSeat.price_modifier),
    },
  });

  await prisma.ticket.create({
    data: {
      id: randomUUID(),
      ticket_number: 'TKT-9832104',
      booking_id: booking.id,
      seat_id: sampleSeat.id,
      passenger_name: 'Prithviraj Sharma',
      passenger_email: 'john.doe@example.com',
      passenger_document: 'P98421092',
      passenger_type: 'ADULT',
      pdf_url: '/api/v1/bookings/tickets/TKT-9832104/pdf',
    },
  });

  await prisma.payment.create({
    data: {
      id: randomUUID(),
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

  console.log('🎉 Complete all-station database seed finished successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
