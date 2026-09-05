import { create } from 'zustand';
import { Flight, FlightSeat, FlightSearchParams, Passenger, Booking } from '../types';

interface BookingStore {
  searchParams: FlightSearchParams;
  selectedFlight: Flight | null;
  selectedSeats: FlightSeat[];
  passengers: Passenger[];
  isAiDrawerOpen: boolean;
  lastConfirmedBooking: Booking | null;

  setSearchParams: (params: Partial<FlightSearchParams>) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  toggleSeat: (seat: FlightSeat, maxPassengers: number) => void;
  setPassengers: (passengers: Passenger[]) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setLastConfirmedBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
}

const initialSearchParams: FlightSearchParams = {
  origin: '',
  destination: '',
  departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  returnDate: '',
  passengers: 1,
  cabinClass: 'ECONOMY',
  maxPrice: undefined,
  sortBy: 'price_asc',
  tripType: 'one-way',
};

export const useBookingStore = create<BookingStore>((set) => ({
  searchParams: initialSearchParams,
  selectedFlight: null,
  selectedSeats: [],
  passengers: [],
  isAiDrawerOpen: false,
  lastConfirmedBooking: null,

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  setSelectedFlight: (flight) =>
    set({
      selectedFlight: flight,
      selectedSeats: [], // Reset seats when picking a new flight
      passengers: [],
    }),

  toggleSeat: (seat, maxPassengers) =>
    set((state) => {
      const isAlreadySelected = state.selectedSeats.some((s) => s.id === seat.id);

      if (isAlreadySelected) {
        return {
          selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id),
        };
      }

      if (state.selectedSeats.length >= maxPassengers) {
        // Replace last or reject if single passenger
        if (maxPassengers === 1) {
          return { selectedSeats: [seat] };
        }
        return state;
      }

      return {
        selectedSeats: [...state.selectedSeats, seat],
      };
    }),

  setPassengers: (passengers) => set({ passengers }),
  setAiDrawerOpen: (open) => set({ isAiDrawerOpen: open }),
  setLastConfirmedBooking: (booking) => set({ lastConfirmedBooking: booking }),
  resetBooking: () =>
    set({
      selectedFlight: null,
      selectedSeats: [],
      passengers: [],
      lastConfirmedBooking: null,
    }),
}));
