export type FreshnessStatus = 'FRESH' | 'RECENT' | 'STALE' | 'EXPIRED' | 'UNKNOWN';

export interface DataFreshnessInfo {
  observedAt: string;
  receivedAt: string;
  ageMinutes: number;
  status: FreshnessStatus;
  source: 'LIVE' | 'CACHED' | 'DATASET' | 'FIELD_REPORT' | 'DEMO';
}

/**
 * Calculates data freshness status based on timestamp age.
 * - FRESH: < 60 minutes
 * - RECENT: < 360 minutes (6 hours)
 * - STALE: < 1440 minutes (24 hours)
 * - EXPIRED: >= 1440 minutes
 */
export function evaluateDataFreshness(
  observedAtInput: string | Date | null | undefined,
  source: 'LIVE' | 'CACHED' | 'DATASET' | 'FIELD_REPORT' | 'DEMO' = 'LIVE'
): DataFreshnessInfo {
  const receivedAt = new Date().toISOString();

  if (!observedAtInput) {
    return {
      observedAt: receivedAt,
      receivedAt,
      ageMinutes: 0,
      status: 'UNKNOWN',
      source,
    };
  }

  const observedAtDate = new Date(observedAtInput);
  const observedAt = observedAtDate.toISOString();
  const diffMs = Math.max(0, Date.now() - observedAtDate.getTime());
  const ageMinutes = Math.floor(diffMs / (1000 * 60));

  let status: FreshnessStatus = 'FRESH';
  if (ageMinutes >= 1440) {
    status = 'EXPIRED';
  } else if (ageMinutes >= 360) {
    status = 'STALE';
  } else if (ageMinutes >= 60) {
    status = 'RECENT';
  }

  return {
    observedAt,
    receivedAt,
    ageMinutes,
    status,
    source,
  };
}
