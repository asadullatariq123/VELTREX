import { prisma } from '../../config/database';
import { WeatherProvider, NormalizedWeatherObservation } from './WeatherProvider';
import { OpenWeatherProvider } from './OpenWeatherProvider';
import { DemoWeatherProvider } from './DemoWeatherProvider';
import { getLocationById } from '../../utils/locationStore';

class WeatherService {
  private cache = new Map<string, { observation: NormalizedWeatherObservation; cachedAt: number }>();
  private refreshCooldowns = new Map<string, number>();

  private getCacheMinutes(): number {
    const min = parseInt(process.env.WEATHER_CACHE_MINUTES || '30', 10);
    return isNaN(min) ? 30 : min;
  }

  private getProvider(): WeatherProvider {
    const providerConfig = (process.env.WEATHER_PROVIDER || 'DEMO').toLowerCase();
    if (providerConfig === 'real' || providerConfig === 'openweather' || providerConfig === 'openweathermap' || providerConfig === 'open_weather') {
      return new OpenWeatherProvider();
    }
    return new DemoWeatherProvider();
  }

  public async getWeatherForLocation(locationId: string): Promise<NormalizedWeatherObservation> {
    const cacheMs = this.getCacheMinutes() * 60 * 1000;
    const now = Date.now();

    // 1. Check in-memory cache first
    const cachedEntry = this.cache.get(locationId);
    if (cachedEntry && now - cachedEntry.cachedAt < cacheMs) {
      return {
        ...cachedEntry.observation,
        source: 'CACHE',
        status: 'CACHED',
      };
    }

    // 2. Fetch location details (Database or In-Memory Fallback)
    const location = await getLocationById(locationId);

    // 3. Attempt provider fetch (Real API or Demo)
    const provider = this.getProvider();
    try {
      const observation = await provider.fetchWeather(
        location.id,
        location.latitude,
        location.longitude,
        location.name,
        location.state.name
      );

      // Save normalized observation into PostgreSQL WeatherReading table if DB available
      try {
        await prisma.weatherReading.create({
          data: {
            locationId: location.id,
            rainfall: observation.current.rainfall,
            humidity: observation.current.humidity,
            temperature: observation.current.temperature,
            windSpeed: observation.current.windSpeed,
            soilMoisture: 70.0, // default baseline
            forecastRainfall: observation.forecast.next24h,
            timestamp: new Date(),
          },
        });
      } catch (dbErr) {
        // DB writing unavailable, continue with memory cache
      }

      // Update in-memory cache
      this.cache.set(locationId, { observation, cachedAt: now });

      return observation;
    } catch (error: any) {
      console.warn(`[WeatherService] Provider ${provider.getProviderName()} failed: ${error.message}. Attempting DB cache fallback.`);

      // 4. Fallback: Recent DB WeatherReading
      let latestDbReading: any = null;
      try {
        latestDbReading = await prisma.weatherReading.findFirst({
          where: { locationId: location.id },
          orderBy: { timestamp: 'desc' },
        });
      } catch (dbReadErr) {
        latestDbReading = null;
      }

      if (latestDbReading) {
        const fallbackObs: NormalizedWeatherObservation = {
          location: {
            id: location.id,
            name: location.name,
            state: location.state.name,
            latitude: location.latitude,
            longitude: location.longitude,
          },
          source: 'CACHE',
          status: 'STALE',
          current: {
            temperature: latestDbReading.temperature,
            humidity: latestDbReading.humidity,
            rainfall: latestDbReading.rainfall,
            windSpeed: latestDbReading.windSpeed,
            condition: 'Stored Observation',
          },
          rainfall: {
            last1h: latestDbReading.rainfall,
            last3h: Math.round(latestDbReading.rainfall * 2.2 * 10) / 10,
            last24h: Math.round(latestDbReading.rainfall * 5.0 * 10) / 10,
          },
          forecast: {
            next6h: Math.round(latestDbReading.forecastRainfall * 0.4 * 10) / 10,
            next12h: Math.round(latestDbReading.forecastRainfall * 0.7 * 10) / 10,
            next24h: latestDbReading.forecastRainfall,
          },
          signals: {
            rainfallSignal: latestDbReading.rainfall > 50 ? 'ELEVATED' : 'NORMAL',
            soilMoistureSignal: latestDbReading.soilMoisture > 70 ? 'ELEVATED' : 'NORMAL',
            weatherTrend: 'STABLE',
          },
          timestamp: latestDbReading.timestamp.toISOString(),
        };

        this.cache.set(locationId, { observation: fallbackObs, cachedAt: now });
        return fallbackObs;
      }

      // 5. If Real OpenWeather Provider is configured, return explicit UNAVAILABLE status without silently generating demo data
      const isRealProvider = provider.getProviderName() === 'OpenWeatherProvider';
      if (isRealProvider) {
        const unavailableObs: NormalizedWeatherObservation = {
          location: {
            id: location.id,
            name: location.name,
            state: location.state.name,
            latitude: location.latitude,
            longitude: location.longitude,
          },
          source: 'UNAVAILABLE',
          status: 'UNAVAILABLE',
          current: {
            temperature: 0,
            humidity: 0,
            rainfall: 0,
            windSpeed: 0,
            condition: 'Weather Data Unavailable',
          },
          rainfall: { last1h: 0, last3h: 0, last24h: 0 },
          forecast: { next6h: 0, next12h: 0, next24h: 0 },
          signals: {
            rainfallSignal: 'NORMAL',
            soilMoistureSignal: 'UNKNOWN',
            weatherTrend: 'STABLE',
          },
          timestamp: new Date().toISOString(),
        };

        this.cache.set(locationId, { observation: unavailableObs, cachedAt: now });
        return unavailableObs;
      }

      // 6. Demo Provider (Only when DEMO mode explicitly configured)
      const demoProvider = new DemoWeatherProvider();
      const demoObs = await demoProvider.fetchWeather(
        location.id,
        location.latitude,
        location.longitude,
        location.name,
        location.state.name
      );

      this.cache.set(locationId, { observation: demoObs, cachedAt: now });
      return demoObs;
    }
  }

  public async refreshWeatherForLocation(locationId: string): Promise<NormalizedWeatherObservation> {
    const lastRefresh = this.refreshCooldowns.get(locationId) || 0;
    const now = Date.now();

    // 60-second cooldown protection against spamming refresh
    if (now - lastRefresh < 60000) {
      const cached = this.cache.get(locationId);
      if (cached) return { ...cached.observation, source: 'CACHE', status: 'CACHED' };
    }

    this.refreshCooldowns.set(locationId, now);
    this.cache.delete(locationId); // invalidate cache to force fresh fetch
    return this.getWeatherForLocation(locationId);
  }

  public async getWeatherHistory(
    locationId: string,
    options?: { from?: Date; to?: Date; limit?: number }
  ) {
    const limit = Math.min(options?.limit || 20, 100);
    const where: any = { locationId };

    if (options?.from || options?.to) {
      where.timestamp = {};
      if (options.from) where.timestamp.gte = options.from;
      if (options.to) where.timestamp.lte = options.to;
    }

    const readings = await prisma.weatherReading.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: {
        location: {
          include: { state: true },
        },
      },
    });

    return readings.map((r) => ({
      id: r.id,
      locationId: r.locationId,
      locationName: r.location.name,
      rainfall: r.rainfall,
      humidity: r.humidity,
      temperature: r.temperature,
      windSpeed: r.windSpeed,
      soilMoisture: r.soilMoisture,
      forecastRainfall: r.forecastRainfall,
      timestamp: r.timestamp.toISOString(),
      source: 'WEATHER_API',
    }));
  }

  public async getRainfallIntelligence(locationId: string) {
    const obs = await this.getWeatherForLocation(locationId);
    const r1 = obs.rainfall.last1h;
    const r3 = obs.rainfall.last3h;
    const r24 = obs.rainfall.last24h;

    const last6h = Math.round(r3 * 1.8 * 10) / 10;
    const last12h = Math.round(r3 * 2.8 * 10) / 10;

    const f6 = obs.forecast.next6h;
    const f12 = obs.forecast.next12h;
    const f24 = obs.forecast.next24h;

    const trend = obs.signals.weatherTrend;

    return {
      locationId,
      locationName: obs.location.name,
      source: obs.source,
      status: obs.status,
      rainfall: {
        last1h: r1,
        last3h: r3,
        last6h,
        last12h,
        last24h: r24,
        forecast6h: f6,
        forecast12h: f12,
        forecast24h: f24,
      },
      trend,
      rainfallSignal: obs.signals.rainfallSignal,
      timestamp: obs.timestamp,
    };
  }
}

export const weatherService = new WeatherService();
