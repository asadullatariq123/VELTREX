/**
 * VELTREX Risk Normalizer
 * Converts raw environmental and terrain measurements into a standardized 0-100 risk score scale.
 */

export const normalizeRainfall = (rainfallMm: number): number => {
  if (rainfallMm <= 0) return 0;
  if (rainfallMm >= 150) return 100;
  return Math.min(100, Math.round((rainfallMm / 150) * 100));
};

export const normalizeSoilMoisture = (soilMoisturePct: number): number => {
  if (soilMoisturePct <= 20) return 0;
  if (soilMoisturePct >= 95) return 100;
  return Math.min(100, Math.round(((soilMoisturePct - 20) / (95 - 20)) * 100));
};

export const normalizeSlope = (slopeDeg: number): number => {
  if (slopeDeg <= 5) return 0;
  if (slopeDeg >= 45) return 100;
  return Math.min(100, Math.round(((slopeDeg - 5) / (45 - 5)) * 100));
};

export const normalizeDisplacement = (displacementMm: number): number => {
  if (displacementMm <= 0) return 0;
  if (displacementMm >= 15) return 100;
  return Math.min(100, Math.round((displacementMm / 15) * 100));
};

export const normalizeHistorical = (score: number): number => {
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const normalizeTerrain = (score: number): number => {
  return Math.min(100, Math.max(0, Math.round(score)));
};

export const normalizeForecastRainfall = (forecastMm: number): number => {
  if (forecastMm <= 0) return 0;
  if (forecastMm >= 120) return 100;
  return Math.min(100, Math.round((forecastMm / 120) * 100));
};
