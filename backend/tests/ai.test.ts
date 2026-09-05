import { parseNaturalLanguageFlightQuery } from '../src/modules/ai/nlpParser';

describe('AI Assistant NLP Parser Tests', () => {
  it('should parse "cheapest flight to Goa next weekend under 5000"', () => {
    const result = parseNaturalLanguageFlightQuery('cheapest flight to Goa next weekend under 5000');
    expect(result.destination).toBe('GOI');
    expect(result.destName).toBe('Goa');
    expect(result.maxPrice).toBeDefined();
    expect(result.departureDate).toBeDefined();
    expect(result.cabinClass).toBe('ECONOMY');
  });

  it('should parse "business class flight from Mumbai to London for 2 passengers"', () => {
    const result = parseNaturalLanguageFlightQuery('business class flight from Mumbai to London for 2 passengers');
    expect(result.origin).toBe('BOM');
    expect(result.destination).toBe('LHR');
    expect(result.passengers).toBe(2);
    expect(result.cabinClass).toBe('BUSINESS');
  });

  it('should parse "first class from Delhi to New York"', () => {
    const result = parseNaturalLanguageFlightQuery('first class from Delhi to New York');
    expect(result.origin).toBe('DEL');
    expect(result.destination).toBe('JFK');
    expect(result.cabinClass).toBe('FIRST');
  });
});
