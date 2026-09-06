/**
 * SkyHaven Frontend Utility Formatters
 * Pure functions for formatting currencies, durations, dates, and flight metadata.
 */

/**
 * Formats a numeric price into a localized currency string.
 * @example formatCurrency(4500, 'INR', 'en-IN') => '₹4,500'
 * @example formatCurrency(120, 'USD', 'en-US') => '$120'
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

/**
 * Formats total flight minutes into hours and minutes representation.
 * @example formatDuration(75) => '1h 15m'
 * @example formatDuration(45) => '45m'
 * @example formatDuration(1500) => '1d 1h'
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';

  const days = Math.floor(minutes / (60 * 24));
  const remainingMinutesAfterDays = minutes % (60 * 24);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const mins = remainingMinutesAfterDays % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${mins}m`;
}

/**
 * Formats a flight departure/arrival date string into a user-friendly format (e.g. "Sat, Sep 12, 2026")
 */
export function formatFlightDate(
  dateInput: string | Date,
  locale: string = 'en-US'
): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats time in 12-hour or 24-hour clock (e.g., "08:30 AM")
 */
export function formatFlightTime(
  dateInput: string | Date,
  locale: string = 'en-US'
): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Converts enum cabin class string into a readable title case name.
 * @example formatCabinClassName('PREMIUM_ECONOMY') => 'Premium Economy'
 */
export function formatCabinClassName(cabinClass: string): string {
  if (!cabinClass) return '';

  return cabinClass
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats stops/layovers count for search filter cards
 */
export function formatStops(stopsCount: number): string {
  if (!stopsCount || stopsCount === 0) return 'Non-stop';
  if (stopsCount === 1) return '1 Stop';
  return `${stopsCount} Stops`;
}

/**
 * Normalizes and formats a booking reference / PNR string into uppercase with hyphen
 * @example formatPNR('sh40291') => 'SH-40291'
 */
export function formatPNR(pnr: string): string {
  if (!pnr) return '';
  const clean = pnr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.startsWith('SH') && clean.length > 2 && !clean.includes('-')) {
    return `SH-${clean.slice(2)}`;
  }
  return clean;
}
