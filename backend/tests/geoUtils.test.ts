import {
  calculateGreatCircleDistanceKm,
  getAirportInfo,
  getAirportDistanceKm,
  estimateFlightDurationMinutes,
} from '../src/utils/geoUtils';

describe('Geographical & Airport Utility Tests', () => {
  describe('calculateGreatCircleDistanceKm', () => {
    it('should return 0 when origin and destination coordinates are identical', () => {
      const distance = calculateGreatCircleDistanceKm(19.0896, 72.8656, 19.0896, 72.8656);
      expect(distance).toBe(0);
    });

    it('should accurately calculate distance between Mumbai (BOM) and Goa (GOI)', () => {
      const distance = calculateGreatCircleDistanceKm(19.0896, 72.8656, 15.38, 73.8314);
      // Actual straight-line distance is ~425 km
      expect(distance).toBeGreaterThanOrEqual(400);
      expect(distance).toBeLessThanOrEqual(460);
    });

    it('should accurately calculate long-haul distance between London (LHR) and New York (JFK)', () => {
      const distance = calculateGreatCircleDistanceKm(51.47, -0.4543, 40.6413, -73.7781);
      // Actual straight-line distance is ~5550 km
      expect(distance).toBeGreaterThan(5400);
      expect(distance).toBeLessThan(5700);
    });
  });

  describe('getAirportInfo', () => {
    it('should fetch valid airport metadata by IATA code', () => {
      const airport = getAirportInfo('BOM');
      expect(airport).toBeDefined();
      expect(airport?.city).toBe('Mumbai');
      expect(airport?.country).toBe('India');
      expect(airport?.timezone).toBe('Asia/Kolkata');
    });

    it('should handle case insensitivity', () => {
      const airport = getAirportInfo('jfk');
      expect(airport).toBeDefined();
      expect(airport?.city).toBe('New York');
      expect(airport?.country).toBe('United States');
    });

    it('should return undefined for unknown airport code', () => {
      const airport = getAirportInfo('XYZ999');
      expect(airport).toBeUndefined();
    });
  });

  describe('getAirportDistanceKm', () => {
    it('should return distance for two registered airports', () => {
      const distance = getAirportDistanceKm('DEL', 'BOM');
      expect(distance).not.toBeNull();
      // Distance DEL-BOM is ~1140 km
      expect(distance).toBeGreaterThan(1100);
      expect(distance).toBeLessThan(1200);
    });

    it('should return null when one or both airports are unknown', () => {
      expect(getAirportDistanceKm('UNKNOWN', 'BOM')).toBeNull();
      expect(getAirportDistanceKm('BOM', 'UNKNOWN')).toBeNull();
    });
  });

  describe('estimateFlightDurationMinutes', () => {
    it('should return 0 minutes for non-positive distances', () => {
      expect(estimateFlightDurationMinutes(0)).toBe(0);
      expect(estimateFlightDurationMinutes(-100)).toBe(0);
    });

    it('should estimate realistic block flight duration including 30m taxi/climb buffer', () => {
      // 800 km distance at 800 km/h = 60m air time + 30m buffer = 90m total
      const duration = estimateFlightDurationMinutes(800, 800, 30);
      expect(duration).toBe(90);
    });
  });
});
