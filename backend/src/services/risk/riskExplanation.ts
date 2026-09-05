import { FactorContributor, RiskLevel } from './riskTypes';

export const generateRiskExplanation = (
  locationName: string,
  riskScore: number,
  riskLevel: RiskLevel,
  contributors: FactorContributor[],
  missingFactors: string[]
): string => {
  if (contributors.length === 0) {
    return `Baseline risk assessment for ${locationName}. Environmental telemetry data is currently limited.`;
  }

  const topTwo = contributors.slice(0, 2);
  const primaryFactor = topTwo[0];
  const secondaryFactor = topTwo[1];

  let explanation = `Landslide risk at ${locationName} is evaluated as ${riskLevel} (${riskScore}/100)`;

  if (primaryFactor) {
    explanation += `, primarily driven by high ${primaryFactor.factor.toLowerCase()} (${primaryFactor.rawValue} ${primaryFactor.unit})`;
  }

  if (secondaryFactor) {
    explanation += ` and elevated ${secondaryFactor.factor.toLowerCase()} (${secondaryFactor.rawValue} ${secondaryFactor.unit}).`;
  } else {
    explanation += `.`;
  }

  // Specific factor highlights
  const dispContrib = contributors.find((c) => c.factorKey === 'displacement');
  if (dispContrib && dispContrib.rawValue > 2.0) {
    explanation += ` Satellite radar detected active surface displacement (+${dispContrib.rawValue} mm).`;
  }

  const forecastContrib = contributors.find((c) => c.factorKey === 'forecastRainfall');
  if (forecastContrib && forecastContrib.rawValue > 50.0) {
    explanation += ` Incoming 24h forecast predicts additional heavy precipitation (+${forecastContrib.rawValue} mm).`;
  }

  if (missingFactors.length > 0) {
    explanation += ` Note: ${missingFactors.join(', ')} data unavailable; calculated using active factors.`;
  }

  return explanation;
};
