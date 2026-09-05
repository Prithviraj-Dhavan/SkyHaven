import { EventEmitter } from 'events';

class SkyHavenEventBus extends EventEmitter {}

export const eventBus = new SkyHavenEventBus();

export const EVENTS = {
  BOOKING_CONFIRMED: 'booking:confirmed',
  BOOKING_CANCELLED: 'booking:cancelled',
  FLIGHT_SCHEDULE_CHANGED: 'flight:schedule_changed',
} as const;
