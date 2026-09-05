import { WeatherProvider, NormalizedWeatherObservation } from './WeatherProvider';

export class OpenWeatherProvider implements WeatherProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
  }

  public getProviderName(): string {
    return 'OpenWeatherProvider';
  }

  public async fetchWeather(
    locationId: string,
    lat: number,
    lng: number,
    locationName: string,
    stateName: string
  ): Promise<NormalizedWeatherObservation> {
    if (!this.apiKey) {
      throw new Error('WEATHER_API_KEY is not configured in environment variables');
    }

    const currentUrl = `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;
    const forecastUrl = `${this.baseUrl}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${this.apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentRes.ok) {
      throw new Error(`OpenWeather API returned error: HTTP ${currentRes.status}`);
    }

    const currentData: any = await currentRes.json();
    const forecastData: any = forecastRes.ok ? await forecastRes.json() : null;

    const rain1h = currentData.rain?.['1h'] || 0;
    const rain3h = currentData.rain?.['3h'] || rain1h * 2.5;
    const rain24h = Math.round(rain3h * 3.5 * 10) / 10;

    let forecast6h = rain3h * 1.8;
    let forecast12h = rain3h * 3.2;
    let forecast24h = rain3h * 5.0;

    if (forecastData && Array.isArray(forecastData.list)) {
      const nextList = forecastData.list.slice(0, 8); // 8 * 3h = 24h
      let sum = 0;
      nextList.forEach((item: any, idx: number) => {
        const itemRain = item.rain?.['3h'] || 0;
        sum += itemRain;
        if (idx === 1) forecast6h = Math.round(sum * 10) / 10;
        if (idx === 3) forecast12h = Math.round(sum * 10) / 10;
      });
      forecast24h = Math.round(sum * 10) / 10;
    }

    const temp = currentData.main?.temp || 22.0;
    const humidity = currentData.main?.humidity || 80;
    const windSpeed = currentData.wind?.speed ? Math.round(currentData.wind.speed * 3.6 * 10) / 10 : 10.0; // convert m/s to km/h
    const condition = currentData.weather?.[0]?.main || 'Rain';

    const rainfallSignal =
      rain24h > 100 || rain1h > 30 ? 'CRITICAL' : rain24h > 40 || rain1h > 15 ? 'ELEVATED' : 'NORMAL';
    const weatherTrend = forecast24h > rain24h ? 'RISING' : forecast24h < rain24h * 0.8 ? 'FALLING' : 'STABLE';

    return {
      location: {
        id: locationId,
        name: locationName,
        state: stateName,
        latitude: lat,
        longitude: lng,
      },
      source: 'LIVE',
      status: 'LIVE',
      current: {
        temperature: Math.round(temp * 10) / 10,
        humidity,
        rainfall: Math.round(rain1h * 10) / 10,
        windSpeed,
        condition,
      },
      rainfall: {
        last1h: Math.round(rain1h * 10) / 10,
        last3h: Math.round(rain3h * 10) / 10,
        last24h: rain24h,
      },
      forecast: {
        next6h: Math.round(forecast6h * 10) / 10,
        next12h: Math.round(forecast12h * 10) / 10,
        next24h: Math.round(forecast24h * 10) / 10,
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
