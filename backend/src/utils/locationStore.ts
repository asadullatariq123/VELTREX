import { prisma, checkDatabaseConnection } from '../config/database';

export interface LocationData {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation: number;
  slope: number;
  geologyType: string;
  landUse: string;
  state: {
    id: string;
    name: string;
    code: string;
  };
}

export const FALLBACK_LOCATIONS: Record<string, LocationData> = {
  'loc-aizawl-01': {
    id: 'loc-aizawl-01',
    name: 'Aizawl High Ridge Corridor',
    district: 'Aizawl',
    latitude: 23.7271,
    longitude: 92.7176,
    elevation: 1132,
    slope: 42.5,
    geologyType: 'Sandstone & Siltstone Formation',
    landUse: 'Urban Steep Slope / NH-54 Corridor',
    state: {
      id: 'state-mz-01',
      name: 'Mizoram',
      code: 'MZ',
    },
  },
  'loc-gangtok-01': {
    id: 'loc-gangtok-01',
    name: 'Gangtok East Corridor',
    district: 'East Sikkim',
    latitude: 27.3389,
    longitude: 88.6065,
    elevation: 1650,
    slope: 38.0,
    geologyType: 'Gneiss & Mica Schist',
    landUse: 'Highway / Mountain Settlement',
    state: {
      id: 'state-sk-01',
      name: 'Sikkim',
      code: 'SK',
    },
  },
  'loc-shillong-01': {
    id: 'loc-shillong-01',
    name: 'Shillong Ridge & Bypass',
    district: 'East Khasi Hills',
    latitude: 25.5788,
    longitude: 91.8933,
    elevation: 1525,
    slope: 32.0,
    geologyType: 'Quartzite & Phyllite',
    landUse: 'Transportation Corridor / Dense Vegetation',
    state: {
      id: 'state-ml-01',
      name: 'Meghalaya',
      code: 'ML',
    },
  },
};

export async function getLocationById(locationId: string): Promise<LocationData> {
  const fallback = FALLBACK_LOCATIONS[locationId] || FALLBACK_LOCATIONS['loc-aizawl-01'];

  const isDbUp = await checkDatabaseConnection();
  if (isDbUp) {
    try {
      const loc = await prisma.location.findUnique({
        where: { id: locationId },
        include: { state: true },
      });

      if (loc && loc.state) {
        return {
          id: loc.id,
          name: loc.name,
          district: loc.district,
          latitude: loc.latitude,
          longitude: loc.longitude,
          elevation: loc.elevation,
          slope: fallback.slope,
          geologyType: fallback.geologyType,
          landUse: fallback.landUse,
          state: {
            id: loc.state.id,
            name: loc.state.name,
            code: loc.state.code,
          },
        };
      }
    } catch (err) {
      // Graceful fallback to in-memory location lookup when DB is down
    }
  }

  // Fallback to match locationId or default to Aizawl
  return fallback;
}
