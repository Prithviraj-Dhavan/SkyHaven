export type Role = 'CUSTOMER' | 'ADMIN';
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type FlightStatus = 'SCHEDULED' | 'DELAYED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  _count?: { bookings: number };
}

export interface Airport {
  id: string;
  code: string;
  name: string;
  cityName: string;
  country: string;
  cityImage?: string;
}

export interface FlightAirport {
  code: string;
  name: string;
  city: string;
  country?: string;
}

export interface FlightSeat {
  id: string;
  seatNumber: string;
  cabinClass: CabinClass;
  isBooked: boolean;
  priceModifier: number;
  row: number;
  column: string;
  isExitRow: boolean;
  totalPrice?: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  origin: FlightAirport;
  destination: FlightAirport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  basePrice: number;
  effectivePrice?: number;
  cabinClass?: CabinClass;
  availableSeatsCount?: number;
  availableCabinSeatsCount?: number;
  gate?: string;
  terminal?: string;
  status: FlightStatus;
  seats?: FlightSeat[];
}

export interface Passenger {
  name: string;
  email: string;
  documentNumber: string;
  type: PassengerType;
  seatId: string;
  seatNumber?: string;
  cabinClass?: CabinClass;
  price?: number;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  passengerEmail: string;
  passengerDocument: string;
  passengerType: PassengerType;
  seatNumber: string;
  cabinClass: CabinClass;
  pdfUrl?: string;
}

export interface PaymentInfo {
  provider: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  transactionRef: string;
  paymentMethod: string;
  cardLast4?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
  user?: { id: string; name: string; email: string; phone?: string };
  flight: Flight;
  tickets: Ticket[];
  payment?: PaymentInfo | null;
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers: number;
  cabinClass: CabinClass;
  maxPrice?: number;
  airlines?: string;
  stops?: string;
  timeOfDay?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'duration_asc' | 'departure_asc';
  tripType: 'one-way' | 'round-trip' | 'multi-city';
}

export interface AiParsedQuery {
  origin?: string;
  originName?: string;
  destination?: string;
  destName?: string;
  departureDate?: string;
  returnDate?: string;
  passengers: number;
  cabinClass: CabinClass;
  maxPrice?: number;
  explanation: string;
  isRoundTrip?: boolean;
}

export interface AdminStats {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    activeFlights: number;
    loadFactorPercent: number;
    totalSeats: number;
    bookedSeats: number;
  };
  recentBookings: Array<{
    id: string;
    bookingReference: string;
    customerName: string;
    customerEmail: string;
    flightNumber: string;
    route: string;
    passengersCount: number;
    totalAmount: number;
    status: BookingStatus;
    createdAt: string;
  }>;
  routePerformance: Array<{
    flightNumber: string;
    route: string;
    airline: string;
    totalBookings: number;
    occupiedSeats: number;
    basePrice: number;
    status: FlightStatus;
  }>;
}
