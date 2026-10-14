import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Flight, FlightSeat, FlightSearchParams, Passenger, Booking } from '../types';

interface BookingStore {
  searchParams: FlightSearchParams;
  selectedFlight: Flight | null;
  returnFlight: Flight | null;
  selectedSeats: FlightSeat[];
  returnSeats: FlightSeat[];
  passengers: Passenger[];
  holdExpiresAt: string | null;
  isAiDrawerOpen: boolean;
  lastConfirmedBooking: Booking | null;
  activeLeg: 'outbound' | 'return';

  setSearchParams: (params: Partial<FlightSearchParams>) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setReturnFlight: (flight: Flight | null) => void;
  toggleSeat: (seat: FlightSeat, maxPassengers: number) => void;
  toggleReturnSeat: (seat: FlightSeat, maxPassengers: number) => void;
  setActiveLeg: (leg: 'outbound' | 'return') => void;
  setPassengers: (passengers: Passenger[]) => void;
  setHoldExpiresAt: (expiresAt: string | null) => void;
  restoreHold: (hold: { flight: Flight; seats: FlightSeat[]; expiresAt: string }) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setLastConfirmedBooking: (booking: Booking | null) => void;
  resetBooking: () => void;
  clearHold: () => void;
}

const initialSearchParams: FlightSearchParams = {
  origin: '',
  destination: '',
  departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  returnDate: '',
  passengers: 1,
  cabinClass: 'ECONOMY',
  maxPrice: undefined,
  sortBy: 'best',
  tripType: 'one-way',
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      searchParams: initialSearchParams,
      selectedFlight: null,
      returnFlight: null,
      selectedSeats: [],
      returnSeats: [],
      passengers: [],
      holdExpiresAt: null,
      isAiDrawerOpen: false,
      lastConfirmedBooking: null,
      activeLeg: 'outbound',

      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      setSelectedFlight: (flight) =>
        set((state) => {
          // If setting the exact same flight, keep selected seats & hold timer intact!
          if (state.selectedFlight && flight && state.selectedFlight.id === flight.id) {
            return {
              selectedFlight: flight,
              selectedSeats: state.selectedSeats,
              holdExpiresAt: state.holdExpiresAt,
            };
          }
          const myHeldSeats = flight?.seats?.filter((s) => s.isHeldByMe) || [];
          return {
            selectedFlight: flight,
            selectedSeats: myHeldSeats,
            passengers: [],
            holdExpiresAt: myHeldSeats.length > 0 ? (myHeldSeats[0].heldUntil || null) : null,
          };
        }),

      setReturnFlight: (flight) =>
        set((state) => {
          if (state.returnFlight && flight && state.returnFlight.id === flight.id) {
            return {
              returnFlight: flight,
              returnSeats: state.returnSeats,
            };
          }
          const myHeldSeats = flight?.seats?.filter((s) => s.isHeldByMe) || [];
          return {
            returnFlight: flight,
            returnSeats: myHeldSeats,
          };
        }),

      toggleSeat: (seat, maxPassengers) =>
        set((state) => {
          const isAlreadySelected = state.selectedSeats.some((s) => s.id === seat.id);

          if (isAlreadySelected) {
            const nextSeats = state.selectedSeats.filter((s) => s.id !== seat.id);
            return {
              selectedSeats: nextSeats,
              holdExpiresAt: nextSeats.length === 0 ? null : state.holdExpiresAt,
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

      toggleReturnSeat: (seat, maxPassengers) =>
        set((state) => {
          const isAlreadySelected = state.returnSeats.some((s) => s.id === seat.id);

          if (isAlreadySelected) {
            const nextSeats = state.returnSeats.filter((s) => s.id !== seat.id);
            return {
              returnSeats: nextSeats,
            };
          }

          if (state.returnSeats.length >= maxPassengers) {
            if (maxPassengers === 1) {
              return { returnSeats: [seat] };
            }
            return state;
          }

          return {
            returnSeats: [...state.returnSeats, seat],
          };
        }),

      setActiveLeg: (leg) => set({ activeLeg: leg }),
      setPassengers: (passengers) => set({ passengers }),
      setHoldExpiresAt: (expiresAt) => set({ holdExpiresAt: expiresAt }),
      restoreHold: ({ flight, seats, expiresAt }) =>
        set({
          selectedFlight: flight,
          selectedSeats: seats,
          holdExpiresAt: expiresAt,
        }),
      setAiDrawerOpen: (open) => set({ isAiDrawerOpen: open }),
      setLastConfirmedBooking: (booking) => set({ lastConfirmedBooking: booking }),
      clearHold: () =>
        set({
          selectedSeats: [],
          returnSeats: [],
          passengers: [],
          holdExpiresAt: null,
        }),
      resetBooking: () =>
        set({
          selectedFlight: null,
          returnFlight: null,
          selectedSeats: [],
          returnSeats: [],
          passengers: [],
          holdExpiresAt: null,
          lastConfirmedBooking: null,
          activeLeg: 'outbound',
        }),
    }),
    {
      name: 'skyhaven-booking-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedFlight: state.selectedFlight,
        returnFlight: state.returnFlight,
        selectedSeats: state.selectedSeats,
        returnSeats: state.returnSeats,
        passengers: state.passengers,
        holdExpiresAt: state.holdExpiresAt,
        activeLeg: state.activeLeg,
      }),
    }
  )
);

