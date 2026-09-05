import { WeatherProvider, NormalizedWeatherObservation } from './WeatherProvider';

export class DemoWeatherProvider implements WeatherProvider {
  public getProviderName(): string {
    return 'DemoWeatherProvider';
  }

  public async fetchWeather(
    locationId: string,
    lat: number,
    lng: number,
    locationName: string,
    stateName: string
  ): Promise<NormalizedWeatherObservation> {
    // Generate believable synthetic weather for location coordinates
    const seed = Math.abs(Math.floor(lat * 100 + lng * 100));
    const rain1h = Math.round(((seed % 15) + 3.2) * 10) / 10;
    const rain3h = Math.round((rain1h * 2.8) * 10) / 10;
    const rain24h = Math.round((rain3h * 2.4) * 10) / 10;

    const forecast6h = Math.round((rain3h * 1.5) * 10) / 10;
    const forecast12h = Math.round((rain3h * 2.5) * 10) / 10;
    const forecast24h = Math.round((rain3h * 3.8) * 10) / 10;

    const temp = Math.round((21 + (seed % 6)) * 10) / 10;
    const humidity = 80 + (seed % 18);
    const windSpeed = Math.round((8 + (seed % 12)) * 10) / 10;

    const rainfallSignal =
      rain24h > 80 ? 'CRITICAL' : rain24h > 40 ? 'ELEVATED' : 'NORMAL';
    const weatherTrend = forecast24h > rain24h ? 'RISING' : 'STABLE';

    return {
      location: {
        id: locationId,
        name: locationName,
        state: stateName,
        latitude: lat,
        longitude: lng,
      },
      source: 'DEMO',
      status: 'DEMO',
      current: {
        temperature: temp,
        humidity,
        rainfall: rain1h,
        windSpeed,
        condition: rain24h > 60 ? 'Heavy Monsoon Rain' : 'Moderate Rain',
      },
      rainfall: {
        last1h: rain1h,
        last3h: rain3h,
        last24h: rain24h,
      },
      forecast: {
        next6h: forecast6h,
        next12h: forecast12h,
        next24h: forecast24h,
      },
      signals: {
        rainfallSignal,
        soilMoistureSignal: 'UNKNOWN',
        weatherTrend,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
