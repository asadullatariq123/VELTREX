import { apiClient } from './apiClient';

export interface SatelliteLayerInfo {
  provider: string;
  resolutionMeters: number;
  lastPassTimestamp: string;
  cloudCoverPct: number;
  displacementDetected: boolean;
  source: 'SATELLITE_PROVIDER' | 'CACHE' | 'DEMO';
  status: 'LIVE' | 'CACHED' | 'DEMO' | 'NO_NEW_OBSERVATION' | 'UNAVAILABLE';
}

export const fetchSatelliteMetadata = async (lat: number, lng: number, locationId = 'aizawl-mizoram'): Promise<SatelliteLayerInfo> => {
  try {
    const res = await apiClient.getSatelliteObservation(locationId);
    if (res.success && res.data) {
      const data = res.data;
      return {
        provider: data.source === 'SATELLITE_PROVIDER' ? 'Sentinel-2 L2A / ISRO Bhuvan' : 'Demo Earth Observation',
        resolutionMeters: 10,
        lastPassTimestamp: data.observationTime || '2026-09-04 06:15 UTC',
        cloudCoverPct: data.cloudCoverage || 14.2,
        displacementDetected: (data.displacement || 0) > 0,
        source: data.source || 'DEMO',
        status: data.status || 'DEMO',
      };
    }
  } catch (e) {
    console.warn('[satelliteService] Backend fetch failed, using fallback metadata');
  }

  return {
    provider: 'Demo Earth Observation',
    resolutionMeters: 10,
    lastPassTimestamp: '2026-09-04 06:15 UTC',
    cloudCoverPct: 14.2,
    displacementDetected: true,
    source: 'DEMO',
    status: 'DEMO',
  };
};
