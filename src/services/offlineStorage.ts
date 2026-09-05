import { IncidentReport } from '../types';

const OFFLINE_REPORTS_KEY = 'veltrex_offline_incident_reports';

export const getOfflineReports = (): IncidentReport[] => {
  try {
    const data = localStorage.getItem(OFFLINE_REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to read offline reports', err);
    return [];
  }
};

export const saveOfflineReport = (report: IncidentReport): IncidentReport[] => {
  const current = getOfflineReports();
  const updated = [report, ...current];
  try {
    localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save offline report', err);
  }
  return updated;
};

export const clearOfflineReports = (): void => {
  try {
    localStorage.removeItem(OFFLINE_REPORTS_KEY);
  } catch (err) {
    console.error('Failed to clear offline reports', err);
  }
};
