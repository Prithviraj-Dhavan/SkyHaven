import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from server dir or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('skyhaven_super_secret_jwt_key_2026_modern_monolith'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().optional().default('smtp.ethereal.email'),
  SMTP_PORT: z.string().optional().default('587').transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('SkyHaven Flights <no-reply@skyhaven.com>'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'gemini', 'anthropic', 'groq', 'rule_engine']).default('rule_engine'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.warn('⚠️ Environment parsing warning. Defaulting variables:', parsedEnv.error.format());
}

export const env = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
