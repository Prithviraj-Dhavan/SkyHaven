export interface ParsedFlightQuery {
  origin?: string;
  originName?: string;
  destination?: string;
  destName?: string;
  departureDate?: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  maxPrice?: number;
  explanation: string;
  suggestedAirlines?: string[];
  isRoundTrip?: boolean;
}

const CITY_MAPPINGS: Record<string, { code: string; name: string }> = {
  delhi: { code: 'DEL', name: 'New Delhi' },
  'new delhi': { code: 'DEL', name: 'New Delhi' },
  mumbai: { code: 'BOM', name: 'Mumbai' },
  bombay: { code: 'BOM', name: 'Mumbai' },
  bangalore: { code: 'BLR', name: 'Bengaluru' },
  bengaluru: { code: 'BLR', name: 'Bengaluru' },
  goa: { code: 'GOI', name: 'Goa' },
  dubai: { code: 'DXB', name: 'Dubai' },
  london: { code: 'LHR', name: 'London' },
  heathrow: { code: 'LHR', name: 'London' },
  'new york': { code: 'JFK', name: 'New York' },
  nyc: { code: 'JFK', name: 'New York' },
  jfk: { code: 'JFK', name: 'New York' },
  singapore: { code: 'SIN', name: 'Singapore' },
  changi: { code: 'SIN', name: 'Singapore' },
  tokyo: { code: 'HND', name: 'Tokyo' },
  haneda: { code: 'HND', name: 'Tokyo' },
  paris: { code: 'CDG', name: 'Paris' },
  'san francisco': { code: 'SFO', name: 'San Francisco' },
  sf: { code: 'SFO', name: 'San Francisco' },
  sydney: { code: 'SYD', name: 'Sydney' },
};

export function parseNaturalLanguageFlightQuery(query: string): ParsedFlightQuery {
  const normalized = query.toLowerCase().trim();

  let origin: string | undefined;
  let originName: string | undefined;
  let destination: string | undefined;
  let destName: string | undefined;
  let departureDate: string | undefined;
  let returnDate: string | undefined;
  let passengers = 1;
  let cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST' = 'ECONOMY';
  let maxPrice: number | undefined;
  let isRoundTrip = false;

  // 1. Detect Cabin Class
  if (normalized.includes('first class') || normalized.includes('first-class')) {
    cabinClass = 'FIRST';
  } else if (normalized.includes('business') || normalized.includes('biz class')) {
    cabinClass = 'BUSINESS';
  } else if (normalized.includes('premium economy') || normalized.includes('premium')) {
    cabinClass = 'PREMIUM_ECONOMY';
  } else {
    cabinClass = 'ECONOMY';
  }

  // 2. Detect Passenger Count
  const paxMatch = normalized.match(/(\d+)\s*(passengers|passenger|pax|people|person|tickets|adults)/);
  if (paxMatch) {
    passengers = Math.max(1, parseInt(paxMatch[1], 10));
  } else if (normalized.includes('for two') || normalized.includes('2 people') || normalized.includes('couple')) {
    passengers = 2;
  } else if (normalized.includes('family') || normalized.includes('for 4')) {
    passengers = 4;
  }

  // 3. Detect Max Price / Budget in INR
  const priceMatch = normalized.match(/(?:under|below|less than|max|budget of|within|cheaper than)\s*(?:[\$₹€£]|usd|inr|rs\.?)?\s*(\d+)/i) ||
                     normalized.match(/[\$₹€£]\s*(\d+)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // 4. Detect Origin & Destination Cities
  // Patterns like "from [city] to [city]" or "[city] to [city]" or "to [city]"
  const fromToMatch = normalized.match(/from\s+([a-z\s]+?)\s+to\s+([a-z\s]+?)(?:\s+(?:next|this|on|tomorrow|under|in|for|with)|$)/i);
  if (fromToMatch) {
    const rawFrom = fromToMatch[1].trim();
    const rawTo = fromToMatch[2].trim();

    for (const [key, val] of Object.entries(CITY_MAPPINGS)) {
      if (rawFrom.includes(key)) {
        origin = val.code;
        originName = val.name;
      }
      if (rawTo.includes(key)) {
        destination = val.code;
        destName = val.name;
      }
    }
  }

  // Fallback destination search: "to [city]" or "in [city]"
  if (!destination) {
    const toMatch = normalized.match(/to\s+([a-z\s]+?)(?:\s+(?:next|this|on|tomorrow|under|in|for|with|from)|$)/i);
    if (toMatch) {
      const target = toMatch[1].trim();
      for (const [key, val] of Object.entries(CITY_MAPPINGS)) {
        if (target.includes(key) || key.includes(target)) {
          destination = val.code;
          destName = val.name;
          break;
        }
      }
    }
  }

  // Fallback origin search: "from [city]"
  if (!origin) {
    const fromMatch = normalized.match(/from\s+([a-z\s]+?)(?:\s+(?:to|next|this|on|tomorrow|under|in|for|with)|$)/i);
    if (fromMatch) {
      const target = fromMatch[1].trim();
      for (const [key, val] of Object.entries(CITY_MAPPINGS)) {
        if (target.includes(key) || key.includes(target)) {
          origin = val.code;
          originName = val.name;
          break;
        }
      }
    }
  }

  // Direct keyword matching across mappings
  if (!destination || !origin) {
    for (const [key, val] of Object.entries(CITY_MAPPINGS)) {
      if (normalized.includes(key)) {
        if (!destination && !origin) {
          destination = val.code;
          destName = val.name;
        } else if (destination && !origin && destination !== val.code) {
          origin = val.code;
          originName = val.name;
        }
      }
    }
  }

  // 5. Detect Date Expressions
  const today = new Date();
  const targetDate = new Date(today);

  if (normalized.includes('tomorrow')) {
    targetDate.setDate(today.getDate() + 1);
    departureDate = targetDate.toISOString().split('T')[0];
  } else if (normalized.includes('next weekend') || normalized.includes('this weekend') || normalized.includes('weekend')) {
    // Find next Saturday
    const day = today.getDay();
    const daysUntilSaturday = (6 - day + 7) % 7 || 7;
    targetDate.setDate(today.getDate() + daysUntilSaturday);
    departureDate = targetDate.toISOString().split('T')[0];
  } else if (normalized.includes('next week') || normalized.includes('next monday')) {
    const day = today.getDay();
    const daysUntilMonday = (1 - day + 7) % 7 || 7;
    targetDate.setDate(today.getDate() + daysUntilMonday);
    departureDate = targetDate.toISOString().split('T')[0];
  } else if (normalized.includes('in 3 days') || normalized.includes('3 days later')) {
    targetDate.setDate(today.getDate() + 3);
    departureDate = targetDate.toISOString().split('T')[0];
  } else {
    // Default to today or tomorrow
    targetDate.setDate(today.getDate() + 1);
    departureDate = targetDate.toISOString().split('T')[0];
  }

  if (normalized.includes('round trip') || normalized.includes('roundtrip') || normalized.includes('return')) {
    isRoundTrip = true;
    const returnD = new Date(targetDate);
    returnD.setDate(targetDate.getDate() + 4);
    returnDate = returnD.toISOString().split('T')[0];
  }

  // Construct readable explanation
  const parts: string[] = [];
  if (originName && destName) {
    parts.push(`Flight from ${originName} (${origin}) to ${destName} (${destination})`);
  } else if (destName) {
    parts.push(`Flight to ${destName} (${destination})`);
  } else {
    parts.push('Flight search');
  }

  if (departureDate) parts.push(`on ${departureDate}`);
  if (cabinClass !== 'ECONOMY') parts.push(`in ${cabinClass.replace('_', ' ')}`);
  if (passengers > 1) parts.push(`for ${passengers} passengers`);
  if (maxPrice) parts.push(`budget under $${maxPrice}`);

  const explanation = `Understood: ${parts.join(', ')}.`;

  return {
    origin,
    originName,
    destination,
    destName,
    departureDate,
    returnDate,
    passengers,
    cabinClass,
    maxPrice,
    explanation,
    isRoundTrip,
  };
}
