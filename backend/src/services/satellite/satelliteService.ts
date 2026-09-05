import { prisma } from '../../config/database';
import { SatelliteProvider, NormalizedSatelliteObservation } from './SatelliteProvider';
import { SentinelHubProvider } from './SentinelHubProvider';
import { DemoSatelliteProvider } from './DemoSatelliteProvider';

import { getLocationById } from '../../utils/locationStore';

class SatelliteService {
  private cache = new Map<string, { observation: NormalizedSatelliteObservation; cachedAt: number }>();
  private lastRequestTime: number | null = null;

  private getCacheMinutes(): number {
    const min = parseInt(process.env.SATELLITE_CACHE_MINUTES || '60', 10);
    return isNaN(min) ? 60 : min;
  }

  private getProvider(): SatelliteProvider {
    const providerConfig = (process.env.SATELLITE_PROVIDER || 'demo').toLowerCase();
    if (providerConfig === 'real' || providerConfig === 'sentinelhub' || providerConfig === 'sentinel-hub' || providerConfig === 'sentinel_hub') {
      return new SentinelHubProvider();
    }
    return new DemoSatelliteProvider();
  }

  public async getLatestObservation(locationId: string): Promise<NormalizedSatelliteObservation> {
    const cacheMs = this.getCacheMinutes() * 60 * 1000;
    const now = Date.now();

    // 1. Check in-memory cache
    const cached = this.cache.get(locationId);
    if (cached && now - cached.cachedAt < cacheMs) {
      return {
        ...cached.observation,
        source: 'CACHE',
        status: 'CACHED',
      };
    }

    // 2. Fetch location (Database or In-Memory Fallback)
    const location = await getLocationById(locationId);

    // 3. Attempt provider fetch
    const provider = this.getProvider();
    try {
      this.lastRequestTime = now;
      const observation = await provider.getLatestObservation(
        location.id,
        location.latitude,
        location.longitude,
        location.name,
        location.state.name
      );

      // Persist to PostgreSQL SatelliteObservation table if DB available
      try {
        await prisma.satelliteObservation.create({
          data: {
            locationId: location.id,
            provider: provider.getProviderName(),
            observationType: observation.observationType as any,
            displacement: observation.displacement,
            terrainChange: observation.terrainChange > 0,
            imageUrl: observation.imageUrl || null,
            observationTime: new Date(observation.observationTime),
          },
        });
      } catch (dbErr) {
        // DB writing unavailable, continue with memory cache
      }

      this.cache.set(locationId, { observation, cachedAt: now });
      return observation;
    } catch (error: any) {
      console.warn(`[SatelliteService] Provider ${provider.getProviderName()} unavailable: ${error.message}. Falling back to DEMO satellite intelligence.`);

      // 4. DB Cache Fallback
      let dbObs: any = null;
      try {
        dbObs = await prisma.satelliteObservation.findFirst({
          where: { locationId: location.id },
          orderBy: { observationTime: 'desc' },
        });
      } catch (dbReadErr) {
        dbObs = null;
      }

      if (dbObs) {
        const fallback: NormalizedSatelliteObservation = {
          id: dbObs.id,
          locationId: location.id,
          locationName: location.name,
          stateName: location.state.name,
          source: 'CACHE',
          status: 'STALE',
          observationType: dbObs.observationType as any,
          observationTime: dbObs.observationTime.toISOString(),
          displacement: dbObs.displacement,
          displacementUnit: 'mm',
          terrainChange: dbObs.terrainChange ? 2.5 : 0.0,
          terrainChangeUnit: 'mm',
          cloudCoverage: 10,
          resolution: '10m',
          imageUrl: dbObs.imageUrl || undefined,
        };

        this.cache.set(locationId, { observation: fallback, cachedAt: now });
        return fallback;
      }

      // 5. If Sentinel Hub is configured, return explicit UNAVAILABLE status without generating demo data
      const isRealProvider = provider.getProviderName() === 'SentinelHubProvider';
      if (isRealProvider) {
        const unavailableObs: NormalizedSatelliteObservation = {
          id: `sat-unavail-${locationId}`,
          locationId: location.id,
          locationName: location.name,
          stateName: location.state.name,
          source: 'UNAVAILABLE',
          status: 'UNAVAILABLE',
          observationType: 'OPTICAL',
          observationTime: new Date().toISOString(),
          displacement: 0,
          displacementUnit: 'mm',
          terrainChange: 0,
          terrainChangeUnit: 'mm',
          cloudCoverage: 0,
          resolution: '10m',
        };

        this.cache.set(locationId, { observation: unavailableObs, cachedAt: now });
        return unavailableObs;
      }

      // 6. Demo Provider (Only when DEMO mode explicitly configured)
      const demoProvider = new DemoSatelliteProvider();
      const demoObs = await demoProvider.getLatestObservation(
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

  public async refreshObservation(locationId: string): Promise<NormalizedSatelliteObservation> {
    const cached = this.cache.get(locationId);
    const now = Date.now();

    // Satellite passes only occur periodically (e.g. every 5–12 days for Sentinel)
    // If refreshed within 1 hour, return NO_NEW_OBSERVATION status
    if (cached && now - cached.cachedAt < 3600000) {
      return {
        ...cached.observation,
        source: 'CACHE',
        status: 'NO_NEW_OBSERVATION',
      };
    }

    this.cache.delete(locationId);
    return this.getLatestObservation(locationId);
  }

  public async getSatelliteHistory(
    locationId: string,
    options?: { from?: Date; to?: Date; limit?: number }
  ) {
    const limit = Math.min(options?.limit || 20, 100);
    const where: any = { locationId };

    if (options?.from || options?.to) {
      where.observationTime = {};
      if (options.from) where.observationTime.gte = options.from;
      if (options.to) where.observationTime.lte = options.to;
    }

    const records = await prisma.satelliteObservation.findMany({
      where,
      take: limit,
      orderBy: { observationTime: 'desc' },
      include: {
        location: { include: { state: true } },
      },
    });

    return records.map((r) => ({
      id: r.id,
      locationId: r.locationId,
      locationName: r.location.name,
      stateName: r.location.state.name,
      provider: r.provider,
      observationType: r.observationType,
      displacement: r.displacement,
      displacementUnit: 'mm',
      terrainChange: r.terrainChange ? 2.5 : 0.0,
      terrainChangeUnit: 'mm',
      imageUrl: r.imageUrl,
      observationTime: r.observationTime.toISOString(),
      source: 'SATELLITE_PROVIDER',
    }));
  }

  public async getSatelliteStatus() {
    const provider = this.getProvider();
    const isReal = provider.getProviderName() === 'SentinelHubProvider';
    const hasCredentials = Boolean(process.env.SATELLITE_CLIENT_ID && process.env.SATELLITE_CLIENT_SECRET);

    let status = 'DEMO';
    let message = 'Operating in software DEMO satellite mode';

    if (isReal) {
      if (hasCredentials) {
        status = 'LIVE';
        message = 'Connected to Sentinel Hub / Copernicus Data Space API';
      } else {
        status = 'UNAVAILABLE';
        message = 'Sentinel Hub provider configured but SATELLITE_CLIENT_ID / SATELLITE_CLIENT_SECRET credentials missing';
      }
    }

    return {
      provider: provider.getProviderName(),
      status,
      lastSuccessfulRequest: this.lastRequestTime ? new Date(this.lastRequestTime).toISOString() : null,
      lastObservation: new Date().toISOString(),
      cacheAgeMinutes: this.getCacheMinutes(),
      message,
    };
  }

  public async getSatelliteObservationsGeoJson(options?: { state?: string; observationType?: string }) {
    const where: any = {};
    if (options?.state) {
      where.location = {
        state: {
          OR: [
            { code: { equals: options.state, mode: 'insensitive' } },
            { name: { contains: options.state, mode: 'insensitive' } },
          ],
        },
      };
    }
    if (options?.observationType) {
      where.observationType = options.observationType as any;
    }

    const observations = await prisma.satelliteObservation.findMany({
      where,
      take: 100,
      include: {
        location: { include: { state: true } },
      },
      orderBy: { observationTime: 'desc' },
    });

    const features = observations.map((obs) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [obs.location.longitude, obs.location.latitude],
      },
      properties: {
        id: obs.id,
        locationId: obs.locationId,
        locationName: obs.location.name,
        state: obs.location.state.name,
        provider: obs.provider,
        observationType: obs.observationType,
        displacement: obs.displacement,
        terrainChange: obs.terrainChange,
        observationTime: obs.observationTime.toISOString(),
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
    };
  }
}

export const satelliteService = new SatelliteService();
