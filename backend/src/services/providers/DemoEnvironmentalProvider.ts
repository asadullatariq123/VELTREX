import { prisma } from '../../config/database';
import {
  EnvironmentalDataProvider,
  EnvironmentalObservation,
} from './EnvironmentalDataProvider';

export class DemoEnvironmentalProvider implements EnvironmentalDataProvider {
  public getStatus() {
    return {
      provider: 'DemoEnvironmentalProvider',
      active: true,
    };
  }

  public async getCurrentData(locationId: string): Promise<EnvironmentalObservation> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        riskZones: { take: 1, orderBy: { createdAt: 'desc' } },
        weatherReadings: { take: 1, orderBy: { timestamp: 'desc' } },
        sensors: { take: 5 },
      },
    });

    if (!location) {
      throw new Error(`Location with ID '${locationId}' not found`);
    }

    const latestWeather = location.weatherReadings[0];
    const riskZone = location.riskZones[0];

    // Find displacement sensor if available
    const dispSensor = location.sensors.find((s) => s.sensorType === 'DISPLACEMENT');
    const displacementVal = dispSensor ? dispSensor.currentValue : 4.2;

    const rainfallVal = latestWeather ? latestWeather.rainfall : 81.4;
    const soilMoistureVal = latestWeather ? latestWeather.soilMoisture : 72.0;
    const tempVal = latestWeather ? latestWeather.temperature : 24.0;
    const humidityVal = latestWeather ? latestWeather.humidity : 86.0;
    const slopeVal = riskZone ? riskZone.slopeContribution || 28.0 : 28.0;

    return {
      locationId: location.id,
      locationName: location.name,
      source: 'DEMO',
      rainfall: {
        value: rainfallVal,
        unit: 'mm',
        period: '3h',
      },
      soilMoisture: {
        value: soilMoistureVal,
        unit: '%',
      },
      slope: {
        value: slopeVal,
        unit: 'degrees',
      },
      terrainDisplacement: {
        value: displacementVal,
        unit: 'mm',
      },
      temperature: {
        value: tempVal,
        unit: 'C',
      },
      humidity: {
        value: humidityVal,
        unit: '%',
      },
      timestamp: latestWeather ? latestWeather.timestamp.toISOString() : new Date().toISOString(),
    };
  }

  public async getHistoricalData(
    locationId: string,
    options?: { from?: Date; to?: Date; limit?: number }
  ): Promise<EnvironmentalObservation[]> {
    const limit = Math.min(options?.limit || 20, 100);
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        riskZones: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!location) {
      throw new Error(`Location with ID '${locationId}' not found`);
    }

    const where: any = { locationId };
    if (options?.from || options?.to) {
      where.timestamp = {};
      if (options.from) where.timestamp.gte = options.from;
      if (options.to) where.timestamp.lte = options.to;
    }

    const weatherRecords = await prisma.weatherReading.findMany({
      where,
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    const slopeVal = location.riskZones[0]?.slopeContribution || 28.0;

    if (weatherRecords.length === 0) {
      // Generate synthetic historical entries if none seeded yet
      const now = Date.now();
      return Array.from({ length: 5 }).map((_, i) => ({
        locationId: location.id,
        locationName: location.name,
        source: 'DEMO',
        rainfall: { value: Math.round((80 - i * 5) * 10) / 10, unit: 'mm', period: '3h' },
        soilMoisture: { value: Math.round(75 - i * 2), unit: '%' },
        slope: { value: slopeVal, unit: 'degrees' },
        terrainDisplacement: { value: Math.round((4.2 - i * 0.4) * 10) / 10, unit: 'mm' },
        temperature: { value: 24 - i, unit: 'C' },
        humidity: { value: 86 - i * 2, unit: '%' },
        timestamp: new Date(now - i * 3600 * 1000 * 3).toISOString(),
      }));
    }

    return weatherRecords.map((w, idx) => ({
      locationId: location.id,
      locationName: location.name,
      source: 'DEMO',
      rainfall: { value: w.rainfall, unit: 'mm', period: '3h' },
      soilMoisture: { value: w.soilMoisture, unit: '%' },
      slope: { value: slopeVal, unit: 'degrees' },
      terrainDisplacement: { value: Math.round((4.2 - idx * 0.3) * 10) / 10, unit: 'mm' },
      temperature: { value: w.temperature, unit: 'C' },
      humidity: { value: w.humidity, unit: '%' },
      timestamp: w.timestamp.toISOString(),
    }));
  }
}

export const demoEnvironmentalProvider = new DemoEnvironmentalProvider();
