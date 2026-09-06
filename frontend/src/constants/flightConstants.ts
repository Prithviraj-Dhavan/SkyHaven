/**
 * Flight, Cabin, and Reservation Constants for SkyHaven
 */

export interface CabinClassDetails {
  name: string;
  badgeColor: string;
  seatPitch: string;
  seatWidth: string;
  cabinBaggage: string;
  checkInBaggage: string;
  mealService: string;
  loungeAccess: boolean;
  priorityBoarding: boolean;
  wifiIncluded: boolean;
  features: string[];
}

export const CABIN_CLASSES_CONFIG: Record<string, CabinClassDetails> = {
  ECONOMY: {
    name: 'Economy',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    seatPitch: '31-32 in',
    seatWidth: '17.5 in',
    cabinBaggage: '7 kg',
    checkInBaggage: '15 kg',
    mealService: 'Complimentary Snacks & Beverages',
    loungeAccess: false,
    priorityBoarding: false,
    wifiIncluded: false,
    features: ['Standard legroom', 'USB charging port', 'In-flight entertainment system'],
  },
  PREMIUM_ECONOMY: {
    name: 'Premium Economy',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    seatPitch: '38 in',
    seatWidth: '19.5 in',
    cabinBaggage: '10 kg',
    checkInBaggage: '25 kg',
    mealService: 'Premium Chef-Curated Meals & Bar',
    loungeAccess: false,
    priorityBoarding: true,
    wifiIncluded: false,
    features: ['Extra 6" legroom', 'Dedicated overhead bin', 'Priority baggage delivery', 'Amenity kit'],
  },
  BUSINESS: {
    name: 'Business Class',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    seatPitch: '60 in (Lie-Flat)',
    seatWidth: '22 in',
    cabinBaggage: '12 kg',
    checkInBaggage: '35 kg',
    mealService: 'Gourmet Multi-Course Dining with Sommelier Pairing',
    loungeAccess: true,
    priorityBoarding: true,
    wifiIncluded: true,
    features: ['180° Lie-flat bed', 'Airport executive lounge access', 'Noise-canceling headphones', 'Fast-track security'],
  },
  FIRST: {
    name: 'First Class',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    seatPitch: '80 in (Private Suite)',
    seatWidth: '28 in',
    cabinBaggage: '15 kg',
    checkInBaggage: '45 kg',
    mealService: 'À La Carte Caviar & Fine Dining on Demand',
    loungeAccess: true,
    priorityBoarding: true,
    wifiIncluded: true,
    features: ['Enclosed private suite with sliding doors', 'Chauffeur airport transfer', 'Dedicated concierge', 'Unlimited high-speed WiFi'],
  },
};

export interface BookingStatusDetails {
  label: string;
  badgeColor: string;
  description: string;
}

export const BOOKING_STATUS_CONFIG: Record<string, BookingStatusDetails> = {
  CONFIRMED: {
    label: 'Confirmed',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Seats are locked and confirmed. Boarding pass is ready.',
  },
  PENDING: {
    label: 'Pending',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    description: 'Awaiting payment confirmation or seat assignment.',
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    description: 'Reservation was cancelled and seats have been released.',
  },
  COMPLETED: {
    label: 'Completed',
    badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    description: 'Trip completed successfully.',
  },
  REFUNDED: {
    label: 'Refunded',
    badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    description: 'Booking refund has been processed back to source.',
  },
};
