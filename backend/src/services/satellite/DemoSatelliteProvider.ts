import { SatelliteProvider, NormalizedSatelliteObservation } from './SatelliteProvider';

export class DemoSatelliteProvider implements SatelliteProvider {
  public getProviderName(): string {
    return 'DemoSatelliteProvider';
  }

  public async getLatestObservation(
    locationId: string,
    lat: number,
    lng: number,
    locationName: string,
    stateName: string
  ): Promise<NormalizedSatelliteObservation> {
    const seed = Math.abs(Math.floor(lat * 100 + lng * 100));
    const displacementVal = Math.round((3.2 + (seed % 8) * 0.6) * 10) / 10;
    const terrainChangeVal = Math.round((displacementVal * 0.65) * 10) / 10;
    const cloudCover = 8 + (seed % 14);

    const sampleImages = [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80'
    ];

    return {
      id: `sat-demo-${locationId}`,
      locationId,
      locationName,
      stateName,
      source: 'DEMO',
      status: 'DEMO',
      observationType: seed % 2 === 0 ? 'SAR' : 'DISPLACEMENT',
      observationTime: new Date(Date.now() - (seed % 6) * 3600 * 1000 * 4).toISOString(),
      displacement: displacementVal,
      displacementUnit: 'mm',
      terrainChange: terrainChangeVal,
      terrainChangeUnit: 'mm',
      cloudCoverage: cloudCover,
      resolution: '10m',
      imageUrl: sampleImages[seed % sampleImages.length],
      productUrl: `https://browser.dataspace.copernicus.eu/demo?lat=${lat}&lng=${lng}`,
      createdAt: new Date().toISOString(),
    };
  }
}
