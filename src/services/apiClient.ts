const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://veltrex-my45.onrender.com/api/v1' : 'http://localhost:5000/api/v1');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  pagination?: {
    limit: number;
    offset?: number;
    total: number;
    page?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || errBody.error || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn(`[ApiClient] Request failed for ${endpoint}:`, err.message || err);
      throw err;
    }
  }

  // Core APIs
  public async getHealth() {
    return this.request<any>('/health');
  }

  public async getDashboardSummary() {
    return this.request<ApiResponse<any>>('/dashboard/summary');
  }

  public async getLocations(params?: { state?: string; district?: string; search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/locations${query ? `?${query}` : ''}`);
  }

  public async getLocationById(id: string) {
    return this.request<ApiResponse<any>>(`/locations/${id}`);
  }

  public async getRiskZones(params?: { riskLevel?: string; state?: string; minScore?: number; maxScore?: number; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/risk-zones${query ? `?${query}` : ''}`);
  }

  public async getRiskZoneById(id: string) {
    return this.request<ApiResponse<any>>(`/risk-zones/${id}`);
  }

  public async getGeospatialRiskZones() {
    return this.request<any>('/geospatial/risk-zones');
  }

  public async getNearbyEntities(latitude: number, longitude: number, radius = 10000) {
    return this.request<ApiResponse<any>>(`/geospatial/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

  public async getStateOverview() {
    return this.request<ApiResponse<any[]>>('/geospatial/states');
  }

  public async getSensors(params?: { type?: string; status?: string; state?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/sensors${query ? `?${query}` : ''}`);
  }

  public async getSensorById(id: string) {
    return this.request<ApiResponse<any>>(`/sensors/${id}`);
  }

  public async getSensorReadings(id: string, params?: { from?: string; to?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/sensors/${id}/readings${query ? `?${query}` : ''}`);
  }

  public async getInfrastructure(params?: { type?: string; state?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/infrastructure${query ? `?${query}` : ''}`);
  }

  public async getInfrastructureById(id: string) {
    return this.request<ApiResponse<any>>(`/infrastructure/${id}`);
  }

  public async getIncidents(params?: { severity?: string; status?: string; state?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/incidents${query ? `?${query}` : ''}`);
  }

  public async getIncidentById(id: string) {
    return this.request<ApiResponse<any>>(`/incidents/${id}`);
  }

  // Environmental Engine APIs
  public async getEnvironmentData(locationId: string) {
    return this.request<ApiResponse<any>>(`/environment/${locationId}`);
  }

  public async getEnvironmentHistory(locationId: string, params?: { from?: string; to?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/environment/${locationId}/history${query ? `?${query}` : ''}`);
  }

  public async getEnvironmentSummary() {
    return this.request<ApiResponse<any>>('/environment/summary');
  }

  // Weather Intelligence Integration APIs
  public async getWeather(locationId: string) {
    return this.request<ApiResponse<any>>(`/weather/${locationId}`);
  }

  public async refreshWeather(locationId: string) {
    return this.request<ApiResponse<any>>(`/weather/${locationId}/refresh`);
  }

  public async getWeatherHistory(locationId: string, params?: { from?: string; to?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/weather/${locationId}/history${query ? `?${query}` : ''}`);
  }

  public async getRainfallIntelligence(locationId: string) {
    return this.request<ApiResponse<any>>(`/weather/${locationId}/rainfall`);
  }

  // Satellite Intelligence APIs
  public async getSatelliteObservation(locationId: string) {
    return this.request<ApiResponse<any>>(`/satellite/${locationId}`);
  }

  public async refreshSatelliteObservation(locationId: string) {
    return this.request<ApiResponse<any>>(`/satellite/${locationId}/refresh`, { method: 'POST' });
  }

  public async getSatelliteHistory(locationId: string, params?: { from?: string; to?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/satellite/${locationId}/history${query ? `?${query}` : ''}`);
  }

  public async getSatelliteStatus() {
    return this.request<ApiResponse<any>>('/satellite/status');
  }

  public async getSatelliteGeoJson(params?: { state?: string; observationType?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any>(`/satellite/observations${query ? `?${query}` : ''}`);
  }

  // Step 7 Explainable Risk Engine APIs
  public async getRiskAssessment(locationId: string) {
    return this.request<ApiResponse<any>>(`/risk/${locationId}`);
  }

  public async recalculateRisk(locationId: string) {
    return this.request<ApiResponse<any>>(`/risk/${locationId}/calculate`, { method: 'POST' });
  }

  public async getRegionalRisk(params?: { state?: string; riskLevel?: string; minScore?: number; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/risk${query ? `?${query}` : ''}`);
  }

  public async getRiskGeoJson() {
    return this.request<any>('/risk/geojson');
  }

  // Step 8 AI/ML Prediction Engine APIs
  public async getPredictions(locationId: string) {
    return this.request<ApiResponse<any>>(`/predictions/${locationId}`);
  }

  public async generatePrediction(locationId: string, horizon = '24H') {
    return this.request<ApiResponse<any>>(`/predictions/${locationId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ horizon }),
    });
  }

  public async getPredictionExplanation(locationId: string, horizon = '24H') {
    return this.request<ApiResponse<any>>(`/predictions/${locationId}/explanation?horizon=${horizon}`);
  }

  public async getPredictionHistory(locationId: string, limit = 20) {
    return this.request<ApiResponse<any[]>>(`/predictions/${locationId}/history?limit=${limit}`);
  }

  public async getPredictionModelInfo() {
    return this.request<ApiResponse<any>>('/predictions/model/info');
  }

  // Step 9 Field Report + Offline Intelligence APIs
  public async createFieldReport(reportData: any) {
    return this.request<ApiResponse<any>>('/field-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  public async getFieldReports(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    verificationStatus?: string;
    reportType?: string;
    locationId?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/field-reports${query ? `?${query}` : ''}`);
  }

  public async getFieldReportById(id: string) {
    return this.request<ApiResponse<any>>(`/field-reports/${id}`);
  }

  public async getFieldReportsGeoJson() {
    return this.request<any>('/geospatial/field-reports');
  }

  public async getNearbyFieldReports(latitude: number, longitude: number, radius = 10000) {
    return this.request<ApiResponse<any[]>>(`/field-reports/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  }

  public async uploadFieldReportMedia(reportId: string, base64Data: string, fileName?: string) {
    return this.request<ApiResponse<any>>(`/field-reports/${reportId}/media`, {
      method: 'POST',
      body: JSON.stringify({ base64Data, fileName }),
    });
  }

  public async getFieldEvidence(locationId: string) {
    return this.request<ApiResponse<any>>(`/field-reports/location/${locationId}/evidence`);
  }

  // Step 10 Early-Warning Alert Engine APIs
  public async getAlerts(params?: {
    status?: string;
    priority?: string;
    alertLevel?: string;
    locationId?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<ApiResponse<any[]>>(`/alerts${query ? `?${query}` : ''}`);
  }

  public async getAlertById(id: string) {
    return this.request<ApiResponse<any>>(`/alerts/${id}`);
  }

  public async generateAlert(locationId: string) {
    return this.request<ApiResponse<any>>(`/alerts/generate/${locationId}`, {
      method: 'POST'
    });
  }

  public async createManualAlert(alertData: {
    locationId?: string;
    alertLevel: string;
    priority: string;
    title: string;
    message: string;
    recommendedAction: string;
    expiresAt?: string;
  }) {
    return this.request<ApiResponse<any>>('/alerts/manual', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  public async acknowledgeAlert(id: string) {
    return this.request<ApiResponse<any>>(`/alerts/${id}/acknowledge`, {
      method: 'POST'
    });
  }

  public async resolveAlert(id: string) {
    return this.request<ApiResponse<any>>(`/alerts/${id}/resolve`, {
      method: 'POST'
    });
  }

  public async getLocalizedAlert(id: string, language: string) {
    return this.request<ApiResponse<any>>(`/alerts/${id}/languages/${language}`);
  }

  public async getAlertsGeoJson() {
    return this.request<any>('/geospatial/alerts');
  }

  // Simulation APIs
  public async getSimulationScenarios() {
    return this.request<ApiResponse<any[]>>('/simulation/scenarios');
  }

  public async getSimulationStatus() {
    return this.request<ApiResponse<any>>('/simulation/status');
  }

  public async startSimulation(body?: { scenarioId?: string; locationId?: string; speed?: string }) {
    return this.request<ApiResponse<any>>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify(body || {})
    });
  }

  public async pauseSimulation() {
    return this.request<ApiResponse<any>>('/simulation/pause', {
      method: 'POST'
    });
  }

  public async resumeSimulation() {
    return this.request<ApiResponse<any>>('/simulation/resume', {
      method: 'POST'
    });
  }

  public async stopSimulation() {
    return this.request<ApiResponse<any>>('/simulation/stop', {
      method: 'POST'
    });
  }

  public async resetSimulation() {
    return this.request<ApiResponse<any>>('/simulation/reset', {
      method: 'POST'
    });
  }
}

export const apiClient = new ApiClient();
