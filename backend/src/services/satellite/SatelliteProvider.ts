export interface NormalizedSatelliteObservation {
  id: string;
  locationId: string;
  locationName?: string;
  stateName?: string;
  source: 'LIVE' | 'SENTINEL_HUB' | 'SATELLITE_PROVIDER' | 'CACHE' | 'DEMO' | 'UNAVAILABLE' | 'STALE';
  status: 'LIVE' | 'AUTH FAILED' | 'DATA REQUEST FAILED' | 'CACHED' | 'DEMO' | 'NO_NEW_OBSERVATION' | 'UNAVAILABLE' | 'STALE' | 'ERROR';
  observationType: 'SAR' | 'OPTICAL' | 'TERRAIN_CHANGE' | 'DISPLACEMENT';
  observationTime: string;
  displacement: number;
  displacementUnit: string;
  terrainChange: number;
  terrainChangeUnit: string;
  cloudCoverage: number;
  resolution: string;
  imageUrl?: string;
  productUrl?: string;
  createdAt?: string;
}

export interface SatelliteProvider {
  getLatestObservation(
    locationId: string,
    lat: number,
    lng: number,
    locationName: string,
    stateName: string
  ): Promise<NormalizedSatelliteObservation>;
  getProviderName(): string;
}
