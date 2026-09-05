export interface NormalizedWeatherObservation {
  location: {
    id: string;
    name: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  source: 'LIVE' | 'WEATHER_API' | 'CACHE' | 'DEMO' | 'UNAVAILABLE' | 'STALE';
  status: 'LIVE' | 'CACHED' | 'DEMO' | 'UNAVAILABLE' | 'STALE' | 'ERROR';
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    condition: string;
  };
  rainfall: {
    last1h: number;
    last3h: number;
    last24h: number;
  };
  forecast: {
    next6h: number;
    next12h: number;
    next24h: number;
  };
  signals: {
    rainfallSignal: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
    soilMoistureSignal: 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'UNKNOWN';
    weatherTrend: 'RISING' | 'STABLE' | 'FALLING';
  };
  timestamp: string;
}

export interface WeatherProvider {
  fetchWeather(
    locationId: string,
    lat: number,
    lng: number,
    locationName: string,
    stateName: string
  ): Promise<NormalizedWeatherObservation>;
  getProviderName(): string;
}
