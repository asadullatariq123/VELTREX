import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.union([z.string(), z.number()]).transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))).default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('veltrex_super_secret_jwt_key_sih2026_production'),
  WEATHER_PROVIDER: z.string().default('DEMO'),
  WEATHER_API_KEY: z.string().optional(),
  WEATHER_API_BASE_URL: z.string().optional(),
  WEATHER_CACHE_MINUTES: z.union([z.string(), z.number()]).transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))).default(30),
  SATELLITE_PROVIDER: z.string().default('DEMO'),
  SATELLITE_API_BASE_URL: z.string().optional(),
  SATELLITE_CLIENT_ID: z.string().optional(),
  SATELLITE_CLIENT_SECRET: z.string().optional(),
  SATELLITE_CACHE_MINUTES: z.union([z.string(), z.number()]).transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))).default(60),
  ALERT_DEDUP_WINDOW_MINUTES: z.union([z.string(), z.number()]).transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))).default(60),
  SIMULATION_DEFAULT_SPEED: z.enum(['SLOW', 'NORMAL', 'FAST']).default('NORMAL'),
  REALTIME_ENABLED: z.union([z.string(), z.boolean()]).transform((val) => String(val) !== 'false').default(true),
  MEDIA_STORAGE_PROVIDER: z.enum(['LOCAL', 'S3']).default('LOCAL'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment Configuration Error: Mandatory environment variable validation failed.');
    console.error(JSON.stringify(result.error.format(), null, 2));
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return envSchema.parse({
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/veltrex?schema=public',
    });
  }

  const data = result.data;

  // Real Provider Credential Validation Warning Audit (without printing secret values)
  const weatherProv = data.WEATHER_PROVIDER.toLowerCase();
  if ((weatherProv === 'openweather' || weatherProv === 'openweathermap' || weatherProv === 'real') && !data.WEATHER_API_KEY) {
    console.warn('⚠️ [ENV VALIDATION] WEATHER_PROVIDER is set to OpenWeather, but WEATHER_API_KEY is not configured in backend/.env.');
  }

  const satelliteProv = data.SATELLITE_PROVIDER.toLowerCase();
  if ((satelliteProv === 'sentinelhub' || satelliteProv === 'sentinel-hub' || satelliteProv === 'real') && (!data.SATELLITE_CLIENT_ID || !data.SATELLITE_CLIENT_SECRET)) {
    console.warn('⚠️ [ENV VALIDATION] SATELLITE_PROVIDER is set to Sentinel Hub, but SATELLITE_CLIENT_ID / SATELLITE_CLIENT_SECRET credentials are missing.');
  }

  return data;
};

export const env = parseEnv();
