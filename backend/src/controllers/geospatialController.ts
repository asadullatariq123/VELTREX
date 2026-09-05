import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { RiskLevel, SensorStatus } from '@prisma/client';

// Helper function to calculate Haversine distance in meters
function getHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const getGeospatialRiskZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const riskZones = await prisma.riskZone.findMany({
      include: {
        location: {
          include: {
            state: true,
          },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const features = riskZones.map((rz) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [rz.location.longitude, rz.location.latitude],
      },
      properties: {
        id: rz.id,
        locationId: rz.locationId,
        location: rz.location.name,
        district: rz.location.district,
        state: rz.location.state.name,
        stateCode: rz.location.state.code,
        elevation: rz.location.elevation,
        riskScore: rz.riskScore,
        riskLevel: rz.riskLevel,
        confidence: rz.confidence,
        rainfallContribution: rz.rainfallContribution,
        soilMoistureContribution: rz.soilMoistureContribution,
        slopeContribution: rz.slopeContribution,
        terrainContribution: rz.terrainContribution,
        historicalContribution: rz.historicalContribution,
        displacementContribution: rz.displacementContribution,
        status: rz.status,
      },
    }));

    const featureCollection = {
      type: 'FeatureCollection',
      features,
    };

    res.status(200).json(featureCollection);
  } catch (error: any) {
    sendError(res, 'GEO_RISK_ZONES_ERROR', error.message || 'Failed to fetch geospatial risk zones', 500);
  }
};

export const getNearbyEntities = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(req.query.latitude as string);
    const lng = parseFloat(req.query.longitude as string);
    const radius = parseFloat((req.query.radius as string) || '10000'); // default 10km (10000 meters)

    if (isNaN(lat) || isNaN(lng)) {
      sendError(res, 'INVALID_COORDINATES', 'Valid latitude and longitude are required', 400);
      return;
    }

    // Fetch all locations and filter by radius
    const allLocations = await prisma.location.findMany({
      include: {
        state: true,
        riskZones: { take: 1, orderBy: { createdAt: 'desc' } },
        sensors: true,
        infrastructure: true,
        incidents: true,
      },
    });

    const nearbyLocations = allLocations
      .map((loc) => {
        const distanceMeters = getHaversineDistanceMeters(lat, lng, loc.latitude, loc.longitude);
        return { loc, distanceMeters };
      })
      .filter((item) => item.distanceMeters <= radius)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const locations = nearbyLocations.map((item) => ({
      id: item.loc.id,
      name: item.loc.name,
      state: item.loc.state.name,
      district: item.loc.district,
      latitude: item.loc.latitude,
      longitude: item.loc.longitude,
      distanceMeters: item.distanceMeters,
      riskLevel: item.loc.riskZones[0]?.riskLevel || 'LOW',
      riskScore: item.loc.riskZones[0]?.riskScore || 0,
    }));

    const riskZones = nearbyLocations.flatMap((item) =>
      item.loc.riskZones.map((rz) => ({
        id: rz.id,
        locationName: item.loc.name,
        riskScore: rz.riskScore,
        riskLevel: rz.riskLevel,
        confidence: rz.confidence,
        distanceMeters: item.distanceMeters,
      }))
    );

    const sensors = nearbyLocations.flatMap((item) =>
      item.loc.sensors.map((s) => ({
        id: s.id,
        stationCode: s.stationCode,
        stationName: s.stationName,
        sensorType: s.sensorType,
        status: s.status,
        distanceMeters: item.distanceMeters,
      }))
    );

    const infrastructure = nearbyLocations.flatMap((item) =>
      item.loc.infrastructure.map((inf) => ({
        id: inf.id,
        name: inf.name,
        type: inf.type,
        distanceMeters: item.distanceMeters,
      }))
    );

    const incidents = nearbyLocations.flatMap((item) =>
      item.loc.incidents.map((inc) => ({
        id: inc.id,
        title: inc.title,
        severity: inc.severity,
        status: inc.status,
        distanceMeters: item.distanceMeters,
      }))
    );

    sendSuccess(res, {
      center: { latitude: lat, longitude: lng, radiusMeters: radius },
      locations,
      riskZones,
      sensors,
      infrastructure,
      incidents,
    });
  } catch (error: any) {
    sendError(res, 'GEO_NEARBY_ERROR', error.message || 'Failed to calculate nearby geographic entities', 500);
  }
};

export const getStateOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const states = await prisma.nerState.findMany({
      include: {
        locations: {
          include: {
            riskZones: true,
            sensors: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const stateSummaries = states.map((state) => {
      const totalMonitoredLocations = state.locations.length;
      let highRiskZones = 0;
      let criticalZones = 0;
      let totalRiskScore = 0;
      let riskZoneCount = 0;
      let activeSensors = 0;

      for (const loc of state.locations) {
        for (const rz of loc.riskZones) {
          if (rz.riskLevel === RiskLevel.HIGH) highRiskZones++;
          if (rz.riskLevel === RiskLevel.CRITICAL) criticalZones++;
          totalRiskScore += rz.riskScore;
          riskZoneCount++;
        }
        for (const s of loc.sensors) {
          if (s.status === SensorStatus.ONLINE) activeSensors++;
        }
      }

      const averageRisk = riskZoneCount > 0 ? Math.round(totalRiskScore / riskZoneCount) : 0;

      return {
        id: state.id,
        name: state.name,
        code: state.code,
        totalMonitoredLocations,
        highRiskZones,
        criticalZones,
        averageRisk,
        activeSensors,
      };
    });

    sendSuccess(res, stateSummaries);
  } catch (error: any) {
    sendError(res, 'GEO_STATES_ERROR', error.message || 'Failed to fetch state overview', 500);
  }
};
