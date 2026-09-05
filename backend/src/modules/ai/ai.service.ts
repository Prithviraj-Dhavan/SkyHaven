import { env } from '../../config/env.js';
import { parseNaturalLanguageFlightQuery, ParsedFlightQuery } from './nlpParser.js';

export interface ILlmProvider {
  parseFlightIntent(prompt: string): Promise<ParsedFlightQuery>;
}

export class AiService {
  public static async parseQuery(prompt: string): Promise<ParsedFlightQuery> {
    // 1. If provider is set to OpenAI and key is available
    if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) {
      try {
        return await this.callOpenAi(prompt);
      } catch (err: any) {
        console.warn('⚠️ OpenAI API call failed, falling back to smart rule-based NLP parser:', err.message);
      }
    }

    // 2. If provider is set to Gemini and key is available
    if (env.AI_PROVIDER === 'gemini' && env.GEMINI_API_KEY) {
      try {
        return await this.callGemini(prompt);
      } catch (err: any) {
        console.warn('⚠️ Gemini API call failed, falling back to smart rule-based NLP parser:', err.message);
      }
    }

    // 3. Resilient Standalone NLP Rule & Regex Parser
    return parseNaturalLanguageFlightQuery(prompt);
  }

  private static async callOpenAi(prompt: string): Promise<ParsedFlightQuery> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are SkyHaven AI Flight Search Assistant. Parse the user flight query into strict JSON:
{
  "origin": string (IATA 3-letter airport code or city name, e.g. "DEL", "BOM", "JFK", "LHR", "GOI"),
  "originName": string,
  "destination": string (IATA code or city),
  "destName": string,
  "departureDate": string (YYYY-MM-DD),
  "returnDate": string or null,
  "passengers": number,
  "cabinClass": "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST",
  "maxPrice": number or null,
  "explanation": string (friendly single sentence summary),
  "isRoundTrip": boolean
}`,
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content);
  }

  private static async callGemini(prompt: string): Promise<ParsedFlightQuery> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Parse user flight query into strict JSON with fields origin, originName, destination, destName, departureDate, returnDate, passengers, cabinClass, maxPrice, explanation, isRoundTrip. Query: "${prompt}"`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  }
}
