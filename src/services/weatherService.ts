import { WeatherData } from '../types';
import { apiClient } from './apiClient';

export const fetchWeatherForLocation = async (lat: number, lng: number, locationId = 'aizawl-mizoram'): Promise<WeatherData> => {
  try {
    const res = await apiClient.getWeather(locationId);
    if (res.success && res.data) {
      const data = res.data;
      return {
        currentRainfallMm: data.current?.rainfall || 82.4,
        rainfallIntensity: data.current?.rainfall > 50 ? 'Torrential' : data.current?.rainfall > 20 ? 'Heavy' : 'Moderate',
        humidityPct: data.current?.humidity || 94,
        temperatureC: data.current?.temperature || 22.8,
        windSpeedKmh: data.current?.windSpeed || 28.5,
        accumulated24hMm: data.rainfall?.last24h || 164.2,
        forecast24h: [
          { time: '18:00', mm: Math.round(data.forecast?.next6h * 0.4) || 14, riskFactor: 0.6 },
          { time: '21:00', mm: Math.round(data.forecast?.next6h * 0.6) || 24, riskFactor: 0.8 },
          { time: '00:00', mm: Math.round(data.forecast?.next12h * 0.5) || 32, riskFactor: 0.95 },
          { time: '03:00', mm: Math.round(data.forecast?.next12h * 0.5) || 28, riskFactor: 0.88 },
          { time: '06:00', mm: Math.round(data.forecast?.next24h * 0.25) || 18, riskFactor: 0.72 },
          { time: '09:00', mm: Math.round(data.forecast?.next24h * 0.15) || 10, riskFactor: 0.45 },
          { time: '12:00', mm: Math.round(data.forecast?.next24h * 0.1) || 6, riskFactor: 0.30 },
        ],
      };
    }
  } catch (e) {
    console.warn('[weatherService] Backend fetch failed, using fallback metrics');
  }

  // Simulated weather fallback if backend is offline
  return {
    currentRainfallMm: 82.4,
    rainfallIntensity: 'Torrential',
    humidityPct: 94,
    temperatureC: 22.8,
    windSpeedKmh: 28.5,
    accumulated24hMm: 164.2,
    forecast24h: [
      { time: '18:00', mm: 14, riskFactor: 0.6 },
      { time: '21:00', mm: 24, riskFactor: 0.8 },
      { time: '00:00', mm: 32, riskFactor: 0.95 },
      { time: '03:00', mm: 28, riskFactor: 0.88 },
      { time: '06:00', mm: 18, riskFactor: 0.72 },
      { time: '09:00', mm: 10, riskFactor: 0.45 },
      { time: '12:00', mm: 6, riskFactor: 0.30 },
    ],
  };
};
