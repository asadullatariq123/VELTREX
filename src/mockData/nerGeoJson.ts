import { FeatureCollection, Feature, Polygon, Geometry } from 'geojson';

/**
 * GeoJSON FeatureCollection containing regional boundaries for the 8 North Eastern Region (NER) states
 * and high-priority landslide risk sector polygons.
 */
export const NER_STATE_BOUNDARIES_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mizoram', riskLevel: 'CRITICAL', riskScore: 87 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [92.30, 24.50], [93.40, 24.30], [93.20, 22.00], [92.20, 22.00], [92.30, 24.50]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Meghalaya', riskLevel: 'HIGH', riskScore: 78 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.80, 25.90], [92.80, 25.90], [92.80, 25.10], [89.80, 25.10], [89.80, 25.90]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Sikkim', riskLevel: 'CRITICAL', riskScore: 82 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [88.00, 28.10], [88.90, 28.10], [88.90, 27.10], [88.00, 27.10], [88.00, 28.10]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Nagaland', riskLevel: 'HIGH', riskScore: 68 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.30, 27.00], [95.20, 27.00], [95.20, 25.20], [93.30, 25.20], [93.30, 27.00]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Manipur', riskLevel: 'HIGH', riskScore: 74 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [93.00, 25.70], [94.80, 25.70], [94.80, 23.80], [93.00, 23.80], [93.00, 25.70]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Arunachal Pradesh', riskLevel: 'MODERATE', riskScore: 61 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.50, 29.50], [97.40, 29.50], [97.40, 26.60], [91.50, 26.60], [91.50, 29.50]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Assam', riskLevel: 'MODERATE', riskScore: 54 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [89.70, 27.90], [96.00, 27.90], [96.00, 24.20], [89.70, 24.20], [89.70, 27.90]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Tripura', riskLevel: 'LOW', riskScore: 35 },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.10, 24.50], [92.40, 24.50], [92.40, 22.90], [91.10, 22.90], [91.10, 24.50]
        ]]
      }
    }
  ]
};

/**
 * Landslide Hazard Sector Overlay Circles (Dynamic heat circles for high-risk points)
 */
export const HIGH_RISK_ZONES_OVERLAY = [
  { id: 'zone-aizawl-sec04', name: 'Aizawl Sector 04 Ridge', center: [23.7271, 92.7176], radius: 18000, riskLevel: 'CRITICAL', riskScore: 87 },
  { id: 'zone-rangpo-nh10', name: 'Rangpo NH-10 Sikkim Corridor', center: [27.3389, 88.6065], radius: 22000, riskLevel: 'CRITICAL', riskScore: 82 },
  { id: 'zone-shillong-peak', name: 'Shillong Peak Pass', center: [25.5788, 91.8933], radius: 20000, riskLevel: 'HIGH', riskScore: 78 },
  { id: 'zone-tupul-valley', name: 'Tupul Valley Manipur', center: [24.8170, 93.9368], radius: 16000, riskLevel: 'HIGH', riskScore: 74 },
  { id: 'zone-phesama-ridge', name: 'Kohima Phesama Ridge', center: [25.6751, 94.1086], radius: 15000, riskLevel: 'HIGH', riskScore: 68 },
];
