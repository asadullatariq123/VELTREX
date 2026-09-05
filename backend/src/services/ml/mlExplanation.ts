import { EnvironmentalFeatures, FeatureImportanceItem, PredictionHorizon } from './mlTypes';

export class MlExplanation {
  public generateHumanExplanation(
    locationName: string,
    horizon: PredictionHorizon,
    probability: number,
    features: EnvironmentalFeatures,
    topImportance: FeatureImportanceItem[]
  ): string {
    const probabilityPct = Math.round(probability * 100);
    const topFactors = topImportance.slice(0, 3);
    const factorNames = topFactors.map((f) => {
      switch (f.feature) {
        case 'rainfall72h':
          return `high 72h cumulative rainfall (${f.rawValue}mm)`;
        case 'soilMoisture':
          return `elevated soil moisture (${f.rawValue}%)`;
        case 'rainfall24h':
          return `intense recent rainfall (${f.rawValue}mm)`;
        case 'slope':
          return `steep terrain slope (${f.rawValue}°)`;
        case 'displacement':
          return `active terrain displacement (${f.rawValue}mm)`;
        case 'historicalActivity':
          return `historical landslide activity`;
        case 'forecastRainfall':
          return `upcoming forecast rainfall (${f.rawValue}mm)`;
        default:
          return `${String(f.feature)}`;
      }
    });

    const windowText =
      horizon === 'NOW'
        ? 'under current conditions'
        : horizon === '6H'
        ? 'within the next 6 hours'
        : horizon === '24H'
        ? 'within the 24-hour forecast window'
        : horizon === '72H'
        ? 'over the next 72 hours'
        : 'in the 7-day outlook';

    let baseText = `VELTREX estimates a ${probabilityPct}% model-estimated likelihood of slope instability for ${locationName} ${windowText}.`;

    if (factorNames.length > 0) {
      baseText += ` Risk is driven primarily by ${factorNames.slice(0, -1).join(', ')} and ${factorNames[factorNames.length - 1]}.`;
    }

    if (features.displacement > 8.0) {
      baseText += ` Recent satellite SAR displacement (${features.displacement}mm) further elevates concern.`;
    } else if (features.forecastRainfall > 50.0) {
      baseText += ` Forecast rainfall (${features.forecastRainfall}mm) may intensify soil saturation.`;
    }

    return baseText;
  }
}

export const mlExplanation = new MlExplanation();
