export interface EnvironmentalMeasurement {
  value: number;
  unit: string;
  period?: string;
}

export interface EnvironmentalObservation {
  locationId: string;
  locationName?: string;
  source: 'DEMO' | 'WEATHER_API' | 'SATELLITE' | 'DATASET' | 'FIELD_REPORT';
  rainfall: EnvironmentalMeasurement;
  soilMoisture: EnvironmentalMeasurement;
  slope: EnvironmentalMeasurement;
  terrainDisplacement: EnvironmentalMeasurement;
  temperature: EnvironmentalMeasurement;
  humidity: EnvironmentalMeasurement;
  timestamp: string;
}

export interface EnvironmentalDataProvider {
  getCurrentData(locationId: string): Promise<EnvironmentalObservation>;
  getHistoricalData(
    locationId: string,
    options?: { from?: Date; to?: Date; limit?: number }
  ): Promise<EnvironmentalObservation[]>;
  getStatus(): { provider: string; active: boolean };
}
