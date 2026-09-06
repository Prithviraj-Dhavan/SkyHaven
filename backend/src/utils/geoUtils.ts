/**
 * Geographical coordinates and airport metadata registry for SkyHaven Aviation
 */
export interface AirportLocation {
  iata: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export const AIRPORT_LOCATIONS: Record<string, AirportLocation> = {
  BOM: { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, timezone: 'Asia/Kolkata' },
  DEL: { iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1000, timezone: 'Asia/Kolkata' },
  BLR: { iata: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', lat: 13.1986, lon: 77.7066, timezone: 'Asia/Kolkata' },
  GOI: { iata: 'GOI', name: 'Dabolim Airport', city: 'Goa', country: 'India', lat: 15.3800, lon: 73.8314, timezone: 'Asia/Kolkata' },
  MAA: { iata: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9941, lon: 80.1709, timezone: 'Asia/Kolkata' },
  HYD: { iata: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2403, lon: 78.4294, timezone: 'Asia/Kolkata' },
  CCU: { iata: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India', lat: 22.6547, lon: 88.4467, timezone: 'Asia/Kolkata' },
  DXB: { iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2532, lon: 55.3657, timezone: 'Asia/Dubai' },
  LHR: { iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lon: -0.4543, timezone: 'Europe/London' },
  JFK: { iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', lat: 40.6413, lon: -73.7781, timezone: 'America/New_York' },
  SIN: { iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, timezone: 'Asia/Singapore' },
  NRT: { iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.7720, lon: 140.3929, timezone: 'Asia/Tokyo' },
};

/**
 * Calculates the great-circle distance between two geographic points using the Haversine formula.
 * @returns Distance in kilometers rounded to the nearest integer.
 */
export function calculateGreatCircleDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const EARTH_RADIUS_KM = 6371;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

/**
 * Retrieves airport information by 3-letter IATA code.
 */
export function getAirportInfo(iataCode: string): AirportLocation | undefined {
  if (!iataCode) return undefined;
  return AIRPORT_LOCATIONS[iataCode.toUpperCase()];
}

/**
 * Computes great-circle distance between two airports by their IATA codes.
 * Returns null if either airport is not found in the registry.
 */
export function getAirportDistanceKm(originIata: string, destIata: string): number | null {
  const origin = getAirportInfo(originIata);
  const dest = getAirportInfo(destIata);

  if (!origin || !dest) {
    return null;
  }

  return calculateGreatCircleDistanceKm(origin.lat, origin.lon, dest.lat, dest.lon);
}

/**
 * Estimates block flight duration in minutes based on distance and standard commercial airliner cruise speed.
 * Includes taxi, climb, descent, and approach buffer.
 */
export function estimateFlightDurationMinutes(
  distanceKm: number,
  averageCruiseSpeedKmh = 800,
  taxiAndBufferMinutes = 30
): number {
  if (distanceKm <= 0) return 0;
  const airTimeHours = distanceKm / averageCruiseSpeedKmh;
  const totalMinutes = Math.round(airTimeHours * 60 + taxiAndBufferMinutes);
  return totalMinutes;
}
