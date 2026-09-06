import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatCabinClassName,
  formatStops,
  formatPNR,
} from './formatters';

describe('Frontend Formatter Utility Tests', () => {
  describe('formatCurrency', () => {
    it('should format USD amounts correctly', () => {
      const formatted = formatCurrency(250, 'USD', 'en-US');
      expect(formatted).toContain('250');
      expect(formatted).toContain('$');
    });

    it('should format INR amounts correctly', () => {
      const formatted = formatCurrency(5000, 'INR', 'en-IN');
      expect(formatted).toContain('5,000');
    });

    it('should return $0 for invalid or NaN values', () => {
      expect(formatCurrency(NaN)).toBe('$0');
      expect(formatCurrency(null as unknown as number)).toBe('$0');
    });
  });

  describe('formatDuration', () => {
    it('should return 0m for 0 or negative minutes', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(-10)).toBe('0m');
    });

    it('should format sub-hour durations', () => {
      expect(formatDuration(45)).toBe('45m');
    });

    it('should format multi-hour durations with minutes', () => {
      expect(formatDuration(75)).toBe('1h 15m');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(155)).toBe('2h 35m');
    });

    it('should format long multi-day flights', () => {
      // 1440 min = 1d
      expect(formatDuration(1500)).toBe('1d 1h');
    });
  });

  describe('formatFlightDate', () => {
    it('should format valid date strings', () => {
      const formatted = formatFlightDate('2026-09-12T10:00:00.000Z', 'en-US');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Sep');
    });

    it('should return empty string for invalid dates', () => {
      expect(formatFlightDate('invalid-date')).toBe('');
      expect(formatFlightDate('')).toBe('');
    });
  });

  describe('formatFlightTime', () => {
    it('should format time in 12-hour AM/PM format', () => {
      const formatted = formatFlightTime('2026-09-12T08:30:00.000Z', 'en-US');
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toMatch(/AM|PM/i);
    });

    it('should return empty string for invalid time', () => {
      expect(formatFlightTime('')).toBe('');
    });
  });

  describe('formatCabinClassName', () => {
    it('should convert enum keys to readable strings', () => {
      expect(formatCabinClassName('ECONOMY')).toBe('Economy');
      expect(formatCabinClassName('PREMIUM_ECONOMY')).toBe('Premium Economy');
      expect(formatCabinClassName('BUSINESS')).toBe('Business');
      expect(formatCabinClassName('FIRST')).toBe('First');
    });

    it('should return empty string if empty input', () => {
      expect(formatCabinClassName('')).toBe('');
    });
  });

  describe('formatStops', () => {
    it('should format stops count', () => {
      expect(formatStops(0)).toBe('Non-stop');
      expect(formatStops(1)).toBe('1 Stop');
      expect(formatStops(2)).toBe('2 Stops');
    });
  });

  describe('formatPNR', () => {
    it('should format and clean PNR references', () => {
      expect(formatPNR('sh10492')).toBe('SH-10492');
      expect(formatPNR('SH-99201')).toBe('SH-99201');
      expect(formatPNR('AB884')).toBe('AB884');
    });

    it('should return empty string for empty input', () => {
      expect(formatPNR('')).toBe('');
    });
  });
});
